import React from "react";
import { Edit, Box, TextField, Button } from "@pankod/refine-mui";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    useForm,
    Controller,
    useFieldArray,
} from "@pankod/refine-react-hook-form";

interface IPost {
    firstName: string;
    email: string;
    skills: string;
}

const defaultValues = {
    firstName: "",
    email: "",
    skills: "",
};

function PostEdit(Props: any) {
    const {
        refineCore: { onFinish },
        saveButtonProps,
        control,
        formState: { errors },
        handleSubmit,
        watch,
    } = useForm<IPost>({
        mode: "onChange",
        defaultValues,
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "skills",
        rules: {
            required: "please add at least one skill",
        },
    });

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Box component="form">
                <>
                    <Controller
                        control={control}
                        name="firstName"
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={!!errors?.firstName}
                                helperText={
                                    errors.firstName &&
                                    `${errors.firstName.message}`
                                }
                                margin="normal"
                                required
                                fullWidth
                                id="firstName"
                                label="First Name"
                                autoFocus
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <TextField
                                {...field}
                                error={!!errors?.email}
                                helperText={
                                    errors.email && `${errors.email.message}`
                                }
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                            />
                        )}
                    />
                    {fields.map(({ id }, index) => {
                        return (
                            <Box
                                key={id}
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    marginRight: "15px",
                                }}
                            >
                                <Controller
                                    control={control}
                                    name={`skills[${index}]`}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            error={!!errors?.skills}
                                            helperText={
                                                errors.skills &&
                                                `${errors.skills.message}`
                                            }
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="skills"
                                            label={`Skill - ${index + 1}`}
                                        />
                                    )}
                                />
                                <DeleteIcon
                                    onClick={() => {
                                        remove(index);
                                    }}
                                    sx={{ color: "red", cursor: "pointer" }}
                                />
                            </Box>
                        );
                    })}
                </>
            </Box>
            <p>{errors.skills && `${errors.skills?.root?.message}`}</p>
            <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                    append("Javascript");
                }}
            >
                Add a skill
            </Button>
        </Edit>
    );
}

export default PostEdit;
