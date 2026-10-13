import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function InputField() {
    return (
        <Field>
            <FieldLabel htmlFor="input-field-link">Link</FieldLabel>
            <Input
                id="input-field-link"
                type="text"
                placeholder="Enter your link"
            />
            <FieldDescription>
                Enter a youtube-link.
            </FieldDescription>
        </Field>
    )
}
