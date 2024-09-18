import React, { useEffect, useState } from "react";
import {
  useAddRoleMutation,
  useUpdateRoleMutation,
} from "../../features/api/roleApi";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { roleSchema } from "../../schemas/validation";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import { info } from "../../schemas/info";
import { Close } from "@mui/icons-material";
import "../../styles/AddRole.scss";
import { moduleSchema } from "../../schemas/moduleSchema";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";

// Helper function to get permissions from schema
const getPermissionsFromSchema = () =>
  moduleSchema.map((module) => ({
    name: module.name,
    subCategory: module.subCategory || [],
  }));

const AddRole = ({
  open = false,
  closeHandler,
  data,
  isUpdate = false,
  setViewOnly,
  isViewOnly,
  setIsUpdate,
}) => {
  const permissions = getPermissionsFromSchema();
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);

  const {
    reset,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(roleSchema),
    mode: "onChange",
    defaultValues: {
      roleName: "",
      permissions: [],
    },
  });

  const [addRole] = useAddRoleMutation();
  const [updateRole] = useUpdateRoleMutation();
  const dispatch = useDispatch();

  // Populate form with data when open or data changes
  useEffect(() => {
    if (open && data) {
      setValue("roleName", data.roleName || "");
      setValue("permissions", data.permissions || []);
      setSelectedMainCategories(
        permissions
          .filter((module) => data?.permissions?.includes(module.name))
          .map((module) => module.name)
      );
    } else {
      reset(); // Reset form if no data
    }
  }, [open, data, setValue, reset]);

  // Close dialog and reset state
  const handleClose = () => {
    reset();
    closeHandler();
    setViewOnly(false);
    setIsUpdate(false);
    dispatch(setPokedData([]));
    setSelectedMainCategories([]);
  };

  // Handle main category checkbox changes
  // This function updates the selected main categories and corresponding permissions
  const handleMainCategoryChange = (e) => {
    const category = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      // If checked, add the main category to the list of selected categories
      setSelectedMainCategories((prev) => [...prev, category]);
      // Add the main category to permissions
      setValue("permissions", [...watch("permissions"), category], {
        shouldValidate: true,
      });
    } else {
      // If unchecked, remove the main category from the list of selected categories
      setSelectedMainCategories((prev) =>
        prev.filter((item) => item !== category)
      );
      // Find the subcategories of the main category to remove them as well
      const subCategoriesToRemove =
        permissions
          .find((mod) => mod.name === category)
          ?.subCategory.map((sub) => sub.name) || [];
      // Remove the main category and its subcategories from permissions
      setValue(
        "permissions",
        watch("permissions").filter(
          (perm) => perm !== category && !subCategoriesToRemove.includes(perm)
        ),
        { shouldValidate: true }
      );
    }
  };

  // Handle subcategory checkbox changes
  // This function updates the permissions when a subcategory checkbox is toggled
  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;

    // Update permissions based on whether the checkbox is checked or not
    setValue(
      "permissions",
      checked
        ? [...watch("permissions"), value]
        : watch("permissions").filter((perm) => perm !== value),
      { shouldValidate: true }
    );
  };
  const validateSubcategories = (selectedPermissions) => {
    let isValid = true;

    // Iterate over selected main categories
    selectedMainCategories.forEach((mainCategory) => {
      // Find the corresponding module schema for the selected main category
      const module = permissions.find((mod) => mod.name === mainCategory);
      

      // If the main category has subcategories
      if (module && module.subCategory.length > 0) {
        // Check if any of the subcategories are selected in permissions
        const selectedSubCategories = module.subCategory.filter((subCat) =>
          selectedPermissions.includes(subCat.name)
        );

        // If no subcategory is selected, mark as invalid
        if (selectedSubCategories.length === 0) {
          isValid = false;
        }
      }
    });

    return isValid;
  };

  // Submit form handler
  const submitHandler = (roleData) => {
    // Validate subcategories
    const isSubcategoryValid = validateSubcategories(roleData.permissions);

    if (!isSubcategoryValid) {
      toast.error(
        role_error_massage_response
      );
      return;
    }

    const body = {
      roleName: roleData.roleName.toUpperCase(),
      permissions: roleData.permissions,
    };

    const action = isUpdate
      ? updateRole({ id: data.id, ...body })
      : addRole(body);
    action
      .unwrap()
      .then((res) => {
        toast.success(
          isUpdate
            ? info.role_update_message_response
            : info.role_add_message_response
        );
        reset();
        handleClose();
      })
      .catch((err) => {
        toast.error(err?.data?.error.message || "An error occurred");
      });
  };

  return (
    <Dialog open={open} fullWidth className="role">
      <DialogTitle className="role__header">
        {isUpdate
          ? info.role_dialog_update_title
          : isViewOnly
          ? info.role_dialog_permission_title
          : info.role_dialog_add_title}
        <Stack>
          <IconButton onClick={handleClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent className="role__content">
        <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="roleName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    disabled={isViewOnly}
                    label="Role Name"
                    variant="outlined"
                    fullWidth
                    margin="dense"
                    size="small"
                    error={!!errors.roleName}
                    helperText={errors.roleName?.message}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Grid container>
            {/* Main Categories */}
            <Grid item xs={12}>
              <FormControl
                component="fieldset"
                variant="standard"
                sx={{
                  padding: 2,
                  border: "1px solid #2D3748",
                  borderRadius: "10px",
                }}
              >
                <FormLabel component="legend" sx={{ padding: "0 20px" }}>
                  Permissions
                </FormLabel>
                <FormGroup>
                  <Stack direction="row" flexWrap="wrap">
                    {permissions.map((module) => (
                      <Controller
                        key={module.name}
                        control={control}
                        name="permissions"
                        render={() => (
                          <FormControlLabel
                            sx={{ flex: 1, flexBasis: "40%" }}
                            control={
                              <Checkbox
                                value={module.name}
                                checked={selectedMainCategories.includes(
                                  module.name
                                )}
                                onChange={handleMainCategoryChange}
                              />
                            }
                            disabled={isViewOnly}
                            label={module.name}
                          />
                        )}
                      />
                    ))}
                  </Stack>
                </FormGroup>
              </FormControl>

              {/* Subcategories */}
              {permissions
                .filter((module) => module.subCategory.length > 0)
                .filter((module) =>
                  selectedMainCategories.includes(module.name)
                )
                .map((module) => (
                  <FormControl
                    component="fieldset"
                    variant="standard"
                    key={module.name}
                    sx={{
                      border: "1px solid #2D3748",
                      borderRadius: "10px",
                      padding: 2,
                      marginTop: 2,
                    }}
                  >
                    <FormLabel component="legend" sx={{ padding: "0 20px" }}>
                      {module.name}
                    </FormLabel>
                    <FormGroup>
                      <Stack direction="row" flexWrap="wrap">
                        {module.subCategory.map((subCat) => (
                          <Controller
                            key={subCat.name}
                            control={control}
                            name="permissions"
                            render={() => (
                              <FormControlLabel
                                sx={{ flex: 1, flexBasis: "40%" }}
                                control={
                                  <Checkbox
                                    value={subCat.name}
                                    checked={watch("permissions").includes(
                                      subCat.name
                                    )}
                                    onChange={handleCheckboxChange}
                                  />
                                }
                                disabled={isViewOnly}
                                label={subCat.name}
                              />
                            )}
                          />
                        ))}
                      </Stack>
                    </FormGroup>
                  </FormControl>
                ))}
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions className="role__actions">
        <Button color="error" variant="contained" onClick={handleClose}>
          Cancel
        </Button>

        {!isViewOnly && (
          <Button
            color="primary"
            variant="contained"
            type="submit"
            form="submit-form"
            disabled={!isValid}
          >
            {isUpdate ? "Save" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AddRole;
