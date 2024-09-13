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

  // Submit form handler
  const submitHandler = (roleData) => {
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
        <Button color="error" onClick={handleClose}>
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

// import React, { Fragment, useEffect, useState } from "react";
// import {
//   useAddRoleMutation,
//   useUpdateRoleMutation,
// } from "../../features/api/roleApi";
// import { Controller, useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { roleSchema } from "../../schemas/validation";
// import {
//   Button,
//   Checkbox,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   FormControlLabel,
//   FormGroup,
//   FormLabel,
//   Grid,
//   IconButton,
//   Stack,
//   TextField,
// } from "@mui/material";
// import { info } from "../../schemas/info";
// import { Close } from "@mui/icons-material";
// import "../../styles/AddRole.scss";
// import { moduleSchema } from "../../schemas/moduleSchema";
// import { toast } from "sonner";
// import { useDispatch } from "react-redux";
// import { setPokedData } from "../../features/slice/authSlice";

// const getPermissionsFromSchema = () => {
//   return moduleSchema.map((module) => ({
//     name: module.name,
//     subCategory: module.subCategory || [],
//   }));
// };

// const AddRole = ({
//   open = false,
//   closeHandler,
//   data,
//   isUpdate = false,
//   setViewOnly,
//   isViewOnly,
//   setIsUpdate,
// }) => {
//   const permissions = getPermissionsFromSchema();
//   console.log("permissions", permissions);
//   const [selectedMainCategories, setSelectedMainCategories] = useState([]);

//   const {
//     reset,
//     handleSubmit,
//     control,
//     setValue,
//     getValues,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     resolver: yupResolver(roleSchema),
//     mode: "onChange",
//     defaultValues: {
//       roleName: "",
//       permissions: [],
//     },
//   });
//   const [addRole] = useAddRoleMutation();
//   const [updateRole] = useUpdateRoleMutation();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (open && data) {
//       setValue("roleName", data.roleName || "[]");
//       setValue("permissions", data.permissions || []);
//       setSelectedMainCategories(
//         permissions
//           .filter((module) => data?.permissions?.includes(module.name))
//           .map((module) => module.name)
//       );
//     } else {
//       reset(); // Reset the form if no data is provided
//     }
//   }, [open, data, setValue, reset]);

//   // console.log("Selected categories:", selectedMainCategories);
//   // console.log("Form permissions:", watch("permission"));

//   // console.log(
//   //   "SUN",
//   //   permission.filter((module) => module.name)
//   // );
//   // console.log("MOON", data?.roleName);

//   // console.log(watch("name"), getValues());
//   const handleClose = () => {
//     reset();
//     closeHandler();
//     setViewOnly(false);
//     setIsUpdate(false);
//     dispatch(setPokedData([]));
//     setSelectedMainCategories([]);
//   };

//   const handleMainCategoryChange = (e) => {
//     const category = e.target.value;
//     const checked = e.target.checked;

//     if (checked) {
//       // Add the main category to the selected categories
//       setSelectedMainCategories([...selectedMainCategories, category]);
//       // Add the main category to permissions
//       setValue("permissions", [...watch("permissions"), category], {
//         shouldValidate: true,
//       });
//     } else {
//       // Remove the main category from selected categories
//       setSelectedMainCategories(
//         selectedMainCategories.filter((item) => item !== category)
//       );

//       // Remove the main category and its subcategories from permissions
//       const module = permissions.find((mod) => mod.name === category);
//       const subCategoriesToRemove = module?.subCategory.map((sub) => sub.name) || [];

//       const newPermissions = watch("permissions").filter(
//         (perm) => perm !== category && !subCategoriesToRemove.includes(perm)
//       );

//       setValue("permissions", newPermissions, { shouldValidate: true });
//     }
//   };

//   const handleCheckboxChange = (e) => {
//     const checked = e.target.checked;
//     const value = e.target.value;

//     if (checked) {
//       setValue("permissions", [...watch("permissions"), value], {
//         shouldValidate: true,
//       });
//     } else {
//       // Remove the subcategory from permissions
//       setValue(
//         "permissions",
//         watch("permissions").filter((perm) => perm !== value),
//         { shouldValidate: true }
//       );
//     }
//   };

//   const submitHandler = (roleData) => {
//     console.log("roleData", roleData);
//     // console.log({ roleData });
//     const filterSelected = permissions?.filter((item) =>
//       roleData?.permissions?.includes(item?.name)
//     );
//     const filterSubCat = filterSelected?.subCategory?.filter((item) =>
//       roleData?.permissions?.includes(item?.name)
//     );
//     console.log("filterse", filterSubCat);
//     const body = {
//       roleName: roleData.roleName,
//       permissions: roleData.permissions.map((item) => item),
//     };

//     if (isUpdate) {
//       updateRole({ id: data.id, ...body })
//         .unwrap()
//         .then((res) => {
//           console.log({ res });
//           const roleUpdateResMessage = "Role Updated Successfully";
//           toast.success(roleUpdateResMessage);
//           reset();
//           handleClose();
//         })
//         .catch((err) => {
//           const roleUpdateErrMessage = err?.data?.error.message;
//           toast.error(roleUpdateErrMessage || "An error occurred");
//         });
//     } else {
//       addRole(body)
//         .unwrap()
//         .then((res) => {
//           console.log({ res });
//           const roleResMessage = "Role Created Successfully";
//           toast.success(roleResMessage);
//           reset();
//           handleClose();
//         })
//         .catch((err) => {
//           // console.log({ err });
//           const roleErrMessage = err?.data?.error.message;
//           toast.error(roleErrMessage || "An error occurred");
//         });
//     }
//   };
//   // useEffect(() => {
//   //   console.log("Form state:", watch("permission"));
//   // }, [watch("permission")]);
//   return (
//     <Dialog open={open} fullWidth onClose={handleClose} className="role">
//       <DialogTitle className="role__header">
//         {isUpdate
//           ? info.role_dialog_update_title
//           : isViewOnly
//           ? "Pemission"
//           : info.role_dialog_add_title}
//         <Stack>
//           <IconButton onClick={handleClose}>
//             <Close />
//           </IconButton>
//         </Stack>
//       </DialogTitle>
//       <DialogContent className="role__content">
//         <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <Controller
//                 name="roleName"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     disabled={isViewOnly}
//                     label="Role Name"
//                     variant="outlined"
//                     fullWidth
//                     margin="dense"
//                     size="small"
//                     error={!!errors.roleName}
//                     helperText={errors.roleName?.message}
//                   />
//                 )}
//               />
//             </Grid>
//           </Grid>

//           <Grid container>
//   {/* Main Categories */}
//   <Grid item xs={12}>
//     <FormControl
//       component="fieldset"
//       variant="standard"
//       sx={{
//         padding: 2,
//         border: "1px solid #2D3748",
//         borderRadius: "10px",
//       }}
//     >
//       <FormLabel
//         component="legend"
//         sx={{
//           padding: "0 20px",
//         }}
//       >
//         Permissions
//       </FormLabel>
//       <FormGroup>
//         <Stack direction="row" flexWrap="wrap">
//           {permissions.map((module) => (
//             <Controller
//               key={module.name}
//               control={control}
//               name="permissions"
//               render={({ field: { value, onChange } }) => (
//                 <FormControlLabel
//                   sx={{
//                     flex: 1,
//                     flexBasis: "35%",
//                   }}
//                   control={
//                     <Checkbox
//                       value={module.name}
//                       checked={selectedMainCategories.includes(module.name)}
//                       onChange={handleMainCategoryChange}
//                     />
//                   }
//                   disabled={isViewOnly}
//                   label={module.name}
//                 />
//               )}
//             />
//           ))}
//         </Stack>
//       </FormGroup>
//     </FormControl>

//     {/* Subcategories */}
//     {permissions
//       .filter((module) => module.subCategory.length > 0)
//       .filter((module) =>
//         selectedMainCategories.includes(module.name)
//       )
//       .map((module, index) => (
//         <FormControl
//           component="fieldset"
//           variant="standard"
//           key={index}
//           sx={{
//             border: "1px solid #2D3748",
//             borderRadius: "10px",
//             padding: 2,
//             marginTop: 2,
//           }}
//         >
//           <FormLabel
//             component="legend"
//             sx={{
//               padding: "0 20px",
//             }}
//           >
//             {module.name}
//           </FormLabel>
//           <FormGroup>
//             <Stack direction="row" flexWrap="wrap">
//               {module.subCategory.map((subCat, subIdx) => (
//                 <Controller
//                   key={subIdx}
//                   control={control}
//                   name="permissions"
//                   render={({ field: { value, onChange } }) => (
//                     <FormControlLabel
//                       sx={{
//                         flex: 1,
//                         flexBasis: "40%",
//                       }}
//                       control={
//                         <Checkbox
//                           value={subCat.name}
//                           checked={watch("permissions").includes(subCat.name)}
//                           onChange={handleCheckboxChange}
//                         />
//                       }
//                       disabled={isViewOnly}
//                       label={subCat.name}
//                     />
//                   )}
//                 />
//               ))}
//             </Stack>
//           </FormGroup>
//         </FormControl>
//       ))}
//   </Grid>
// </Grid>

//         </form>
//       </DialogContent>
//       <DialogActions className="role__actions">
//         <Button color="error" onClick={handleClose}>
//           Cancel
//         </Button>

//         {!isViewOnly && (
//           <Button
//             color="primary"
//             variant="contained"
//             type="submit"
//             form="submit-form"
//             disabled={!isValid}
//           >
//             {isUpdate ? "Save" : "Create"}
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddRole;

// import React, { Fragment, useEffect, useState } from "react";
// import {
//   useAddRoleMutation,
//   useUpdateRoleMutation,
// } from "../../features/api/roleApi";
// import { Controller, useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { roleSchema } from "../../schemas/validation";
// import {
//   Button,
//   Checkbox,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   FormControlLabel,
//   FormGroup,
//   FormLabel,
//   Grid,
//   IconButton,
//   Stack,
//   TextField,
// } from "@mui/material";
// import { info } from "../../schemas/info";
// import { Close } from "@mui/icons-material";
// import "../../styles/AddRole.scss";
// import { moduleSchema } from "../../schemas/moduleSchema";
// import { toast } from "sonner";
// import { useDispatch } from "react-redux";
// import { setPokedData } from "../../features/slice/authSlice";

// const getPermissionsFromSchema = () => {
//   return moduleSchema.map((module) => ({
//     name: module.name,
//     subCategory: module.subCategory || [],
//   }));
// };

// const AddRole = ({
//   open = false,
//   closeHandler,
//   data,
//   isUpdate = false,
//   setViewOnly,
//   isViewOnly,
//   setIsUpdate,
// }) => {
//   const permissions = getPermissionsFromSchema();
//   console.log("permissions", permissions);
//   const [selectedMainCategories, setSelectedMainCategories] = useState([]);

//   const {
//     reset,
//     handleSubmit,
//     control,
//     setValue,
//     getValues,
//     watch,
//     formState: { errors, isValid },
//   } = useForm({
//     resolver: yupResolver(roleSchema),
//     mode: "onChange",
//     defaultValues: {
//       roleName: "",
//       permissions: [],
//     },
//   });
//   const [addRole] = useAddRoleMutation();
//   const [updateRole] = useUpdateRoleMutation();
//   const dispatch = useDispatch();

//   useEffect(() => {
//     if (open && data) {
//       setValue("roleName", data.roleName || "[]");
//       setValue("permissions", data.permissions || []);
//       setSelectedMainCategories(
//         permissions
//           .filter((module) => data?.permissions?.includes(module.name))
//           .map((module) => module.name)
//       );
//     } else {
//       reset(); // Reset the form if no data is provided
//     }
//   }, [open, data, setValue, reset]);

//   // console.log("Selected categories:", selectedMainCategories);
//   // console.log("Form permissions:", watch("permission"));

//   // console.log(
//   //   "SUN",
//   //   permission.filter((module) => module.name)
//   // );
//   // console.log("MOON", data?.roleName);

//   // console.log(watch("name"), getValues());
//   const handleClose = () => {
//     reset();
//     closeHandler();
//     setViewOnly(false);
//     setIsUpdate(false);
//     dispatch(setPokedData([]));
//     setSelectedMainCategories([]);
//   };

//   const handleMainCategoryChange = (e) => {
//     const category = e.target.value;
//     const checked = e.target.checked;

//     if (checked) {
//       setSelectedMainCategories([...selectedMainCategories, category]);
//       setValue("permissions", [...watch("permissions"), category], {
//         shouldValidate: true,
//       });
//     } else {
//       setSelectedMainCategories(
//         selectedMainCategories.filter((item) => item !== category)
//       );
//       setValue(
//         "permissions",
//         watch("permissions").filter((perm) => perm !== category),
//         { shouldValidate: true }
//       );
//     }
//   };

//   const handleCheckboxChange = (e) => {
//     const checked = e.target.checked;
//     const value = e.target.value;

//     if (checked) {
//       setValue("permissions", [...watch("permissions"), value], {
//         shouldValidate: true,
//       });
//     } else {
//       setValue(
//         "permissions",
//         watch("permissions").filter((perm) => perm !== value),
//         { shouldValidate: true }
//       );
//     }
//   };

//   const submitHandler = (roleData) => {
//     console.log("roleData", roleData);
//     // console.log({ roleData });
//     const filterSelected = permissions?.filter((item) =>
//       roleData?.permissions?.includes(item?.name)
//     );
//     const filterSubCat = filterSelected?.subCategory?.filter((item) =>
//       roleData?.permissions?.includes(item?.name)
//     );
//     console.log("filterse", filterSubCat);
//     const body = {
//       roleName: roleData.roleName,
//       permissions: roleData.permissions.map((item) => item),
//     };

//     if (isUpdate) {
//       updateRole({ id: data.id, ...body })
//         .unwrap()
//         .then((res) => {
//           console.log({ res });
//           const roleUpdateResMessage = "Role Updated Successfully";
//           toast.success(roleUpdateResMessage);
//           reset();
//           handleClose();
//         })
//         .catch((err) => {
//           const roleUpdateErrMessage = err?.data?.error.message;
//           toast.error(roleUpdateErrMessage || "An error occurred");
//         });
//     } else {
//       addRole(body)
//         .unwrap()
//         .then((res) => {
//           console.log({ res });
//           const roleResMessage = "Role Created Successfully";
//           toast.success(roleResMessage);
//           reset();
//           handleClose();
//         })
//         .catch((err) => {
//           // console.log({ err });
//           const roleErrMessage = err?.data?.error.message;
//           toast.error(roleErrMessage || "An error occurred");
//         });
//     }
//   };
//   // useEffect(() => {
//   //   console.log("Form state:", watch("permission"));
//   // }, [watch("permission")]);
//   return (
//     <Dialog open={open} fullWidth onClose={handleClose} className="role">
//       <DialogTitle className="role__header">
//         {isUpdate
//           ? info.role_dialog_update_title
//           : isViewOnly
//           ? "Pemission"
//           : info.role_dialog_add_title}
//         <Stack>
//           <IconButton onClick={handleClose}>
//             <Close />
//           </IconButton>
//         </Stack>
//       </DialogTitle>
//       <DialogContent className="role__content">
//         <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <Controller
//                 name="roleName"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     disabled={isViewOnly}
//                     label="Role Name"
//                     variant="outlined"
//                     fullWidth
//                     margin="dense"
//                     size="small"
//                     error={!!errors.roleName}
//                     helperText={errors.roleName?.message}
//                   />
//                 )}
//               />
//             </Grid>
//           </Grid>

//           <Grid container>
//             {/* Main Categories */}
//             <Grid item xs={12}>
//               <FormControl
//                 component="fieldset"
//                 variant="standard"
//                 sx={{
//                   padding: 2,
//                   border: "1px solid #2D3748",
//                   borderRadius: "10px",
//                 }}
//               >
//                 <FormLabel
//                   component="legend"
//                   sx={{
//                     padding: "0 20px",
//                   }}
//                 >
//                   Permissions
//                 </FormLabel>
//                 <FormGroup>
//                   <Stack direction="row" flexWrap="wrap">
//                     {permissions.map((module) => (
//                       <Controller
//                         key={module.name}
//                         control={control}
//                         name="permissions"
//                         render={({ field: { value, onChange } }) => (
//                           <FormControlLabel
//                             sx={{
//                               flex: 1,
//                               flexBasis: "35%",

//                             }}
//                             control={
//                               <Checkbox
//                                 value={module.name}
//                                 checked={selectedMainCategories.includes(
//                                   module.name
//                                 )}
//                                 onChange={handleMainCategoryChange}
//                               />
//                             }
//                             disabled={isViewOnly}
//                             label={module.name}
//                           />
//                         )}
//                       />
//                     ))}
//                   </Stack>
//                 </FormGroup>
//               </FormControl>

//               {/* Subcategories */}
//               {permissions
//                 .filter((module) => module.subCategory.length > 0)
//                 .filter((module) =>
//                   selectedMainCategories.includes(module.name)
//                 )
//                 .map((module, index) => (
//                   <FormControl
//                     component="fieldset"
//                     variant="standard"
//                     key={index}
//                     sx={{
//                       border: "1px solid #2D3748",
//                       borderRadius: "10px",
//                       padding: 2,
//                       marginTop: 2,
//                     }}
//                   >
//                     <FormLabel
//                       component="legend"
//                       sx={{
//                         padding: "0 20px",
//                       }}
//                     >
//                       {module.name}
//                     </FormLabel>
//                     <FormGroup>
//                       <Stack direction="row" flexWrap="wrap">
//                         {module.subCategory.map((subCat, subIdx) => (
//                           <Controller
//                             key={subIdx}
//                             control={control}
//                             name="permissions"
//                             render={({ field: { value, onChange } }) => (
//                               <FormControlLabel
//                                 sx={{
//                                   flex: 1,
//                                   flexBasis: "40%",
//                                 }}
//                                 control={
//                                   <Checkbox
//                                     value={subCat.name}
//                                     checked={value?.includes(subCat.name)}
//                                     onChange={handleCheckboxChange}
//                                   />
//                                 }
//                                 disabled={isViewOnly}
//                                 label={subCat.name}
//                               />
//                             )}
//                           />
//                         ))}
//                       </Stack>
//                     </FormGroup>
//                   </FormControl>
//                 ))}
//             </Grid>
//           </Grid>
//         </form>
//       </DialogContent>
//       <DialogActions className="role__actions">
//         <Button color="error" onClick={handleClose}>
//           Cancel
//         </Button>

//         {!isViewOnly && (
//           <Button
//             color="primary"
//             variant="contained"
//             type="submit"
//             form="submit-form"
//             disabled={!isValid}
//           >
//             {isUpdate ? "Save" : "Create"}
//           </Button>
//         )}
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default AddRole;
