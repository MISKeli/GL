import * as yup from "yup";
export const loginSchema = yup.object().shape({
  username: yup.string().required("Username is required."),
  password: yup.string().required("Password is required."),
});

export const userSchema = yup.object().shape({
  idPrefix: yup.string().required("Id Prefix is required."),
  idNumber: yup.string().required("Id Number is required."),
  firstName: yup.string().required("First Name is required."),
  lastName: yup.string().required("Last Name is required."),
  userRoleId: yup.object().required("User role Id is required."),
  sex: yup.string().required("Sex is required."),
  username: yup.string().required("Username is required."),
  // password: yup.string().required("Password is required."),
});
export const roleSchema = yup.object().shape({
  roleName: yup.string().required("Id Role Name is required."),
  permissions: yup
    .array()
    .of(yup.string().required())
    .min(1, "At least one permission is required"),
});
export const changePasswordSchema = yup.object().shape({
  oldPassword: yup.string().required("Old Password is required."),
  newPassword: yup.string().required("New Password is required."),
});
