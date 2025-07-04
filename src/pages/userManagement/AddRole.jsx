/* eslint-disable react/prop-types */
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
import { Close } from "@mui/icons-material";
import { info } from "../../schemas/info";
import "../../styles/AddRole.scss";
import { moduleSchema } from "../../schemas/moduleSchema";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setPokedData } from "../../features/slice/authSlice";
import ConfirmedDialog from "../../components/ConfirmedDialog";
import { useGetAllSystemsAsyncQuery } from "../../features/api/systemApi";

const AddRole = ({
  open = false,
  closeHandler,
  data,
  isUpdate = false,
  setViewOnly,
  isViewOnly,
  setIsUpdate,
}) => {
  const [selectedMainCategories, setSelectedMainCategories] = useState([]);
  const [selectedSystems, setSelectedSystems] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState({});
  const [isSubcategoryValid, setIsSubcategoryValid] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [originalData, setOriginalData] = useState({
    roleName: "",
    permissions: [],
  });

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

  const { data: systemData } = useGetAllSystemsAsyncQuery({
    UsePagination: false,
    isActive: true,
  });

  const permissions = getPermissionsFromSchema(systemData);

  // Remove duplicates from array
  const removeDuplicates = (array) => [...new Set(array)];

  // Check if there are changes compared to original data
  const hasChanges = () => {
    const currentRoleName = watch("roleName") || "";
    const currentPermissions = watch("permissions") || [];

    return (
      currentRoleName.toUpperCase() !== originalData.roleName.toUpperCase() ||
      !arraysEqual(
        removeDuplicates(currentPermissions).sort(),
        removeDuplicates(originalData.permissions).sort()
      )
    );
  };

  // Helper function to compare arrays
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
  };

  // Parse existing permissions and books from data
  const parseExistingPermissions = (existingPermissions) => {
    const mainCategories = [];
    const systems = [];
    const books = {};

    if (!existingPermissions) return { mainCategories, systems, books };

    const uniquePermissions = removeDuplicates(existingPermissions);

    uniquePermissions.forEach((permission) => {
      // Check if it's a main category
      const mainCategory = permissions.find((p) => p.name === permission);
      if (mainCategory) {
        mainCategories.push(permission);
        return;
      }

      // Check if it's a system (subcategory)
      let isSystem = false;
      for (const module of permissions) {
        const system = module.subCategory?.find(
          (sub) => sub.name === permission
        );
        if (system) {
          systems.push(permission);
          isSystem = true;
          break;
        }
      }

      // Check if it's a book (format: "systemName - bookName")
      if (!isSystem && permission.includes(" - ")) {
        for (const module of permissions) {
          for (const sub of module.subCategory || []) {
            if (permission.startsWith(sub.name + " - ")) {
              const systemName = sub.name;
              const bookName = permission.substring(sub.name.length + 3);

              if (!books[systemName]) books[systemName] = [];
              if (!books[systemName].includes(bookName)) {
                books[systemName].push(bookName);
              }
              if (!systems.includes(systemName)) {
                systems.push(systemName);
              }
              return;
            }
          }
        }
      }
    });

    return {
      mainCategories: removeDuplicates(mainCategories),
      systems: removeDuplicates(systems),
      books,
    };
  };

  // Populate form with data when open or data changes
  useEffect(() => {
    if (open && data) {
      const roleName = data.roleName || "";
      const permissions = removeDuplicates(data.permissions || []);

      setValue("roleName", roleName);
      setValue("permissions", permissions);
      setOriginalData({ roleName, permissions });

      const { mainCategories, systems, books } =
        parseExistingPermissions(permissions);
      setSelectedMainCategories(mainCategories);
      setSelectedSystems(systems);
      setSelectedBooks(books);
    } else {
      reset();
      setOriginalData({ roleName: "", permissions: [] });
      setSelectedMainCategories([]);
      setSelectedSystems([]);
      setSelectedBooks({});
    }
  }, [open, data, setValue, reset]);

  // Update permissions array when selections change
  useEffect(() => {
    const allPermissions = [
      ...selectedMainCategories,
      ...selectedSystems,
      ...Object.entries(selectedBooks).flatMap(([systemName, books]) =>
        books.map((bookName) => `${systemName} - ${bookName}`)
      ),
    ];

    setValue("permissions", removeDuplicates(allPermissions), {
      shouldValidate: true,
    });
  }, [selectedMainCategories, selectedSystems, selectedBooks, setValue]);

  // Validate permissions
  useEffect(() => {
    setIsSubcategoryValid(validatePermissions());
  }, [selectedMainCategories, selectedSystems, selectedBooks]);

  // Close dialog and reset state
  const handleClose = () => {
    reset();
    closeHandler();
    setViewOnly(false);
    setIsUpdate(false);
    dispatch(setPokedData([]));
    setSelectedMainCategories([]);
    setSelectedSystems([]);
    setSelectedBooks({});
    setOriginalData({ roleName: "", permissions: [] });
  };

  // Handle main category checkbox changes
  const handleMainCategoryChange = (e) => {
    const category = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      setSelectedMainCategories((prev) =>
        removeDuplicates([...prev, category])
      );
    } else {
      setSelectedMainCategories((prev) =>
        prev.filter((item) => item !== category)
      );

      // Remove all systems and books for this category
      const moduleToRemove = permissions.find((mod) => mod.name === category);
      if (moduleToRemove && moduleToRemove.subCategory) {
        const systemsToRemove = moduleToRemove.subCategory.map(
          (sub) => sub.name
        );
        setSelectedSystems((prev) =>
          prev.filter((sys) => !systemsToRemove.includes(sys))
        );

        const newSelectedBooks = { ...selectedBooks };
        systemsToRemove.forEach((systemName) => {
          delete newSelectedBooks[systemName];
        });
        setSelectedBooks(newSelectedBooks);
      }
    }
  };

  // Handle system checkbox changes
  const handleSystemChange = (e) => {
    const systemName = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      setSelectedSystems((prev) => removeDuplicates([...prev, systemName]));
    } else {
      setSelectedSystems((prev) => prev.filter((sys) => sys !== systemName));
      // Remove all books for this system
      const newSelectedBooks = { ...selectedBooks };
      delete newSelectedBooks[systemName];
      setSelectedBooks(newSelectedBooks);
    }
  };

  // Handle book checkbox changes
  const handleBookChange = (e, systemName) => {
    const bookName = e.target.value;
    const checked = e.target.checked;

    setSelectedBooks((prev) => {
      const systemBooks = prev[systemName] || [];

      if (checked) {
        return {
          ...prev,
          [systemName]: removeDuplicates([...systemBooks, bookName]),
        };
      } else {
        const updatedBooks = systemBooks.filter((book) => book !== bookName);
        if (updatedBooks.length === 0) {
          const { [systemName]: removed, ...rest } = prev;
          return rest;
        }
        return { ...prev, [systemName]: updatedBooks };
      }
    });
  };

  // Validate permissions - Updated to handle all modules with subcategories
  const validatePermissions = () => {
    // Check all selected main categories that have subcategories
    for (const categoryName of selectedMainCategories) {
      const module = permissions.find((mod) => mod.name === categoryName);

      if (module && module.subCategory && module.subCategory.length > 0) {
        // Check if at least one system is selected for this category
        const categorySystemNames = module.subCategory.map((sub) => sub.name);
        const hasSelectedSystems = categorySystemNames.some((systemName) =>
          selectedSystems.includes(systemName)
        );

        if (!hasSelectedSystems) {
          return false;
        }
      }
    }

    // Check if selected systems with books have at least one book selected
    for (const systemName of selectedSystems) {
      const system = permissions
        .flatMap((mod) => mod.subCategory || [])
        .find((sub) => sub.name === systemName);

      if (system && system.books && system.books.length > 0) {
        const systemBooks = selectedBooks[systemName] || [];
        if (systemBooks.length === 0) return false;
      }
    }

    return true;
  };

  const addRoleRequest = async (roleData) => {
    try {
      if (isUpdate) {
        await updateRole(roleData).unwrap();
        toast.success(info.role.messages.updateSuccess);
      } else {
        await addRole(roleData).unwrap();
        toast.success(info.role.messages.addedSuccess);
      }
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to process the request.");
    }
  };

  // Submit form handler
  const submitHandler = (roleData) => {
    if (!validatePermissions()) {
      toast.error(
        "Please select required systems and books for selected categories."
      );
      return;
    }

    const body = {
      roleName: roleData.roleName.toUpperCase(),
      permissions: removeDuplicates(roleData.permissions),
    };

    if (isUpdate) {
      setShowConfirmDialog(true);
    } else {
      addRoleRequest(body);
    }
  };

  const handleYes = () => {
    setShowConfirmDialog(false);
    addRoleRequest({
      id: data.id,
      roleName: watch("roleName").toUpperCase(),
      permissions: removeDuplicates(watch("permissions")),
    });
  };

  // Check if save button should be disabled
  const isSaveDisabled = () => {
    if (!isValid || !isSubcategoryValid) return true;
    if (isUpdate && !hasChanges()) return true;
    return false;
  };

  // Get all modules with subcategories that are selected
  const getSelectedModulesWithSubcategories = () => {
    return permissions.filter(
      (module) =>
        module.subCategory &&
        module.subCategory.length > 0 &&
        selectedMainCategories.includes(module.name)
    );
  };

  // Get systems with books for book display
  const getSystemsWithBooks = () => {
    const allSystemsWithBooks = [];

    permissions.forEach((module) => {
      if (module.subCategory) {
        module.subCategory.forEach((system) => {
          if (
            selectedSystems.includes(system.name) &&
            system.books &&
            system.books.length > 0
          ) {
            allSystemsWithBooks.push(system);
          }
        });
      }
    });

    return allSystemsWithBooks;
  };

  const selectedModulesWithSubcategories =
    getSelectedModulesWithSubcategories();
  const systemsWithBooks = getSystemsWithBooks();

  return (
    <>
      <Dialog open={open} fullWidth maxWidth="md" className="role">
        <DialogTitle className="role__header" fontWeight={600}>
          {isUpdate
            ? info.role.dialogs.updateTitle
            : isViewOnly
            ? info.role.dialogs.permissionTitle
            : info.role.dialogs.addTitle}
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
                    {info.role.dialogs.permissionTitle}
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
                                  disabled={isViewOnly}
                                />
                              }
                              label={module.name}
                            />
                          )}
                        />
                      ))}
                    </Stack>
                  </FormGroup>
                </FormControl>

                {/* Systems/Subcategories (For all modules that have them) */}
                {selectedModulesWithSubcategories.map((module) => (
                  <FormControl
                    key={`systems-${module.name}`}
                    component="fieldset"
                    variant="standard"
                    sx={{
                      border: "1px solid #2D3748",
                      borderRadius: "10px",
                      padding: 2,
                      marginTop: 2,
                    }}
                  >
                    <FormLabel component="legend" sx={{ padding: "0 20px" }}>
                      {module.name} - Systems
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
                                    checked={selectedSystems.includes(
                                      subCat.name
                                    )}
                                    onChange={handleSystemChange}
                                    disabled={isViewOnly}
                                  />
                                }
                                label={subCat.name}
                              />
                            )}
                          />
                        ))}
                      </Stack>
                    </FormGroup>
                  </FormControl>
                ))}

                {/* Books (For all systems that have them) */}
                {systemsWithBooks.map((system) => (
                  <FormControl
                    component="fieldset"
                    variant="standard"
                    key={`books-${system.name}`}
                    sx={{
                      border: "1px solid #2D3748",
                      borderRadius: "10px",
                      padding: 2,
                      marginTop: 2,
                    }}
                  >
                    <FormLabel component="legend" sx={{ padding: "0 20px" }}>
                      {system.name} - Books
                    </FormLabel>
                    <FormGroup>
                      <Stack direction="row" flexWrap="wrap">
                        {system.books.map((book) => (
                          <Controller
                            key={`${system.name}-${book.name}`}
                            control={control}
                            name="permissions"
                            render={() => (
                              <FormControlLabel
                                sx={{ flex: 1, flexBasis: "40%" }}
                                control={
                                  <Checkbox
                                    value={book.name}
                                    checked={(
                                      selectedBooks[system.name] || []
                                    ).includes(book.name)}
                                    onChange={(e) =>
                                      handleBookChange(e, system.name)
                                    }
                                    disabled={isViewOnly}
                                  />
                                }
                                label={book.name}
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
              disabled={isSaveDisabled()}
            >
              {isUpdate ? "Save" : "Create"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <ConfirmedDialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title={info.role.dialogs.updateTitle}
        description={info.role.dialogs.updateDescription}
        onYes={handleYes}
      />
    </>
  );
};

// Keep the existing getPermissionsFromSchema function
const getPermissionsFromSchema = (systemData) => {
  const systemPermissions =
    systemData?.value?.result
      ?.filter((item) => item.isActive)
      .map((item) => {
        let books = [];

        if (
          item.bookParameter &&
          item.bookParameter.trim() !== "" &&
          item.bookParameter !== "[]"
        ) {
          try {
            const parsedBooks = JSON.parse(item.bookParameter);
            books = parsedBooks
              .filter((book) => book.status !== false)
              .map((book) => ({
                name: book.bookName,
                id: book.id || book.bookName,
              }));
          } catch (error) {
            console.error(
              `Error parsing bookParameter for ${item.systemName}:`,
              error
            );
            books = [];
          }
        }

        return {
          name: item.systemName,
          books: books,
          subCategory: [],
        };
      }) || [];

  // Create a copy of moduleSchema to avoid mutation
  const modulePermissions = moduleSchema.map((module) => ({
    ...module,
    subCategory: module.subCategory ? [...module.subCategory] : [],
  }));

  // Find or create General Ledger module and add systems + IMPORT BUTTON
  const glModuleIndex = modulePermissions.findIndex(
    (module) => module.name === "General Ledger"
  );

  if (glModuleIndex !== -1) {
    modulePermissions[glModuleIndex].subCategory.push(...systemPermissions, {
      name: "IMPORT BUTTON",
      books: null,
      subCategory: [],
    });
  } else {
    modulePermissions.push({
      name: "General Ledger",
      subCategory: [
        ...systemPermissions,
        { name: "IMPORT BUTTON", books: null, subCategory: [] },
      ],
    });
  }

  return modulePermissions;
};

export default AddRole;
