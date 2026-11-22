import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projects = [
  ["Root", "package.json", "package-lock.json"],
  ["Backend", "subchecker-backend/package.json", "subchecker-backend/package-lock.json"],
  ["Frontend", "subchecker-web-app/package.json", "subchecker-web-app/package-lock.json"],
];
const dependencyTypes = ["dependencies", "devDependencies", "optionalDependencies"];

function packageNameFromLockPath(lockPath) {
  const marker = "node_modules/";
  const markerIndex = lockPath.lastIndexOf(marker);
  if (markerIndex === -1) {
    return lockPath || "(project root)";
  }

  const packagePath = lockPath.slice(markerIndex + marker.length);
  const parts = packagePath.split("/");
  return parts[0].startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

function resolvePackagePath(packages, name, fromPath = "") {
  let current = fromPath;

  while (true) {
    const candidate = current
      ? `${current}/node_modules/${name}`
      : `node_modules/${name}`;
    if (packages[candidate]) {
      return candidate;
    }

    if (!current) {
      return undefined;
    }

    const parent = path.posix.dirname(current);
    current = parent === "." ? "" : parent;
  }
}

function packageLabel(lockPath, metadata) {
  const name = metadata.name ?? packageNameFromLockPath(lockPath);
  return `${name}@${metadata.version ?? "unknown"}`;
}

function escapeTableCell(value) {
  return value.replaceAll("|", "\\|");
}

function findPeerRequirements(packages, startPath, directDependencyNames) {
  const pending = [{
    lockPath: startPath,
    chain: [packageLabel(startPath, packages[startPath])],
  }];
  const visited = new Set();
  const requirements = [];

  while (pending.length > 0) {
    const current = pending.shift();
    if (visited.has(current.lockPath)) {
      continue;
    }
    visited.add(current.lockPath);

    const metadata = packages[current.lockPath];
    for (const [peer, range] of Object.entries(metadata.peerDependencies ?? {})
      .sort(([a], [b]) => a.localeCompare(b))) {
      if (!directDependencyNames.has(peer)) {
        continue;
      }

      requirements.push({
        package: packageLabel(current.lockPath, metadata),
        peer,
        range,
        optional: metadata.peerDependenciesMeta?.[peer]?.optional === true,
        chain: current.chain,
      });
    }

    const dependencies = {
      ...metadata.dependencies,
      ...metadata.optionalDependencies,
    };

    for (const name of Object.keys(dependencies).sort()) {
      const dependencyPath = resolvePackagePath(packages, name, current.lockPath);
      if (dependencyPath && !visited.has(dependencyPath)) {
        pending.push({
          lockPath: dependencyPath,
          chain: [...current.chain, packageLabel(dependencyPath, packages[dependencyPath])],
        });
      }
    }
  }

  return requirements;
}

const sections = [];

for (const [label, manifestFile, lockfile] of projects) {
  const manifestPath = path.join(root, manifestFile);
  const lockfilePath = path.join(root, lockfile);
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const lock = JSON.parse(await readFile(lockfilePath, "utf8"));

  if (lock.lockfileVersion !== 3 || !lock.packages) {
    throw new Error(`Unsupported or invalid npm lockfile: ${lockfile}`);
  }

  const dependencySections = [];
  const directDependencyNames = new Set(
    dependencyTypes.flatMap((type) => Object.keys(manifest[type] ?? {})),
  );

  for (const type of dependencyTypes) {
    const declared = Object.entries(manifest[type] ?? {})
      .sort(([a], [b]) => a.localeCompare(b));
    if (declared.length === 0) {
      continue;
    }

    const dependencies = [];
    for (const [name, declaredRange] of declared) {
      const directPath = resolvePackagePath(lock.packages, name);
      if (!directPath) {
        throw new Error(
          `Could not resolve ${name} from ${manifestFile} in ${lockfile}`,
        );
      }

      const metadata = lock.packages[directPath];
      const peers = findPeerRequirements(
        lock.packages,
        directPath,
        directDependencyNames,
      );
      const heading = `### \`${packageLabel(directPath, metadata)}\` (\`${type}\`: \`${declaredRange}\`)`;
      const table = peers.length > 0
        ? [
          "| Package in dependency tree | Peer requirement | Dependency path from direct package |",
          "| --- | --- | --- |",
          ...peers.map((peer) => {
            const optional = peer.optional ? " (optional)" : "";
            return `| \`${peer.package}\` | \`${peer.peer}\`: \`${escapeTableCell(peer.range)}\`${optional} | ${peer.chain.map((item) => `\`${item}\``).join(" -> ")} |`;
          }),
        ]
        : ["No peer dependencies declared in this dependency tree."];

      dependencies.push([heading, "", ...table].join("\n"));
    }

    dependencySections.push([
      `#### ${type}`,
      "",
      ...dependencies,
    ].join("\n\n"));
  }

  sections.push([
    `## ${label} (\`${manifestFile.replaceAll("\\", "/")}\`)`,
    "",
    ...dependencySections,
  ].join("\n\n"));
}

const content = [
  "# Peer dependency overview",
  "",
  "<!-- Generated by `npm run deps:peers`; do not edit by hand. -->",
  "",
  "Each entry starts with a direct dependency declared in a project `package.json`.",
  "The table below lists only peer requirements for packages that are also declared",
  "directly in that project. It shows which direct dependency tree introduces each",
  "requirement and the path to its source. Optional peers are marked. Versions and",
  "dependency paths come from the corresponding npm lockfile.",
  "",
  "Regenerate after dependency or lockfile changes with `npm run deps:peers`.",
  "",
  ...sections,
  "",
].join("\n");

await writeFile(path.join(root, "PEER_DEPENDENCIES.md"), content);
