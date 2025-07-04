/* eslint-disable react/prop-types */
import { yupResolver } from "@hookform/resolvers/yup";
import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slider,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { closedDate } from "../../schemas/validation";
import { defaultValue } from "../../schemas/defaultValue";
import { usePutSystemClosedDateMutation } from "../../features/api/closedDateApi";
import { toast } from "sonner";

import ConfirmedDialog from "../../components/ConfirmedDialog";

const length = 15;

const marks = Array.from({ length: Math.ceil(length) }, (_, i) => ({
  value: i * 3,
  label: String(i * 3),
}));

const ClosedDateDialog = ({ open = false, closeHandler, data }) => {
  const [UpdateClosedDate] = usePutSystemClosedDateMutation();
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const { handleSubmit, reset, watch, setValue, control } = useForm({
    resolver: yupResolver(closedDate),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: [defaultValue.closedDate],
  });
  // console.log("data", data, data?.value?.[0]?.closedDate);
  const handleFormValue = () => {
    setValue("closedDate", data?.value?.[0]?.closedDate || "");
  };
  //console.log("water", watch("closedDate"));
  useEffect(() => {
    if (open && data) {
      handleFormValue();
    }
  }, [open, data]);

  const submitHandler = () => {
    setOpenConfirmDialog(true); // Open confirmation dialog when updating
  };

  const handleConfirmYes = () => {
    handleSubmit(confirmSubmit)(); // Continue the submission after user confirms
    setOpenConfirmDialog(false); // Close the confirmation dialog
  };

  const confirmSubmit = async (formData) => {
    setLoading(true);
    const updateBody = {
      id: data?.value?.[0]?.id,
      closedDate: formData.closedDate,
    };

    try {
      await UpdateClosedDate(updateBody).unwrap();
      toast.success("System Modiefied Successfully.");
      reset();
      handleClose();
      setOpenConfirmDialog(false);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset(defaultValue.closedDate);
    closeHandler();
  };

  function valuetext(value) {
    return `${value}`;
  }

  return (
    <>
      <Dialog open={open} fullWidth>
        <DialogTitle
          fontWeight={600}
          display={"flex"}
          justifyContent={"space-between"}
        >
          UPDATE
          <Stack>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box marginTop={"40px"}>
            <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
              <Controller
                name="closedDate"
                control={control}
                render={({ field }) => (
                  <Slider
                    {...field}
                    aria-label="Temperature"
                    value={field.value}
                    marks={marks}
                    getAriaValueText={valuetext}
                    valueLabelDisplay="auto"
                    shiftStep={1}
                    step={1}
                    min={1}
                    max={length}
                  />
                )}
              />
            </form>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setOpenConfirmDialog(true);
            }}
            form="submit-form"
            disabled={loading}
            startIcon={
              loading ? <CircularProgress color="info" size={20} /> : null
            }
          >
            {loading ? "Processing..." : "Save"}
          </Button>
        </DialogActions>
        <ConfirmedDialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          title="Confirm Changes"
          description="Are you sure you want to save the changes?"
          onYes={handleConfirmYes}
        />
      </Dialog>
    </>
  );
};

export default ClosedDateDialog;

// /* eslint-disable react/prop-types */
// import { yupResolver } from "@hookform/resolvers/yup";
// import { Close } from "@mui/icons-material";
// import {
//   Box,
//   Button,
//   CircularProgress,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Slider,
//   Stack,
// } from "@mui/material";
// import React, { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { closedDate } from "../../schemas/validation";
// import { defaultValue } from "../../schemas/defaultValue";
// import { usePutSystemClosedDateMutation } from "../../features/api/closedDateApi";
// import { toast } from "sonner";

// import ConfirmedDialog from "../../components/ConfirmedDialog";

// const length = 15;

// const marks = Array.from({ length: Math.ceil(length) }, (_, i) => ({
//   value: i * 3,
//   label: String(i * 3),
// }));

// const ClosedDateDialog = ({ open = false, closeHandler, data }) => {
//   const [UpdateClosedDate] = usePutSystemClosedDateMutation();
//   const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const { handleSubmit, reset, watch, setValue, control } = useForm({
//     resolver: yupResolver(closedDate),
//     mode: "onChange",
//     reValidateMode: "onChange",
//     defaultValues: [defaultValue.closedDate],
//   });
//   // console.log("data", data, data?.value?.pagedResult?.[0]?.closedDate);
//   const handleFormValue = () => {
//     setValue("closedDate", data?.value?.pagedResult?.[0]?.closedDate || "");
//   };
//   //console.log("water", watch("closedDate"));
//   useEffect(() => {
//     if (open && data) {
//       handleFormValue();
//     }
//   }, [open, data]);

//   const submitHandler = () => {
//     setOpenConfirmDialog(true); // Open confirmation dialog when updating
//   };

//   const handleConfirmYes = () => {
//     handleSubmit(confirmSubmit)(); // Continue the submission after user confirms
//     setOpenConfirmDialog(false); // Close the confirmation dialog
//   };

//   const confirmSubmit = async (formData) => {
//     setLoading(true);
//     const updateBody = {
//       id: data?.value?.pagedResult?.[0]?.id,
//       closedDate: formData.closedDate,
//     };

//     try {
//       await UpdateClosedDate(updateBody).unwrap();
//       toast.success("System Updated Successfully");
//       reset();
//       handleClose();
//       setOpenConfirmDialog(false);
//     } catch (error) {
//       toast.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     reset(defaultValue.closedDate);
//     closeHandler();
//   };

//   function valuetext(value) {
//     return `${value}`;
//   }

//   return (
//     <>
//       <Dialog open={open} fullWidth>
//         <DialogTitle
//           fontWeight={600}
//           display={"flex"}
//           justifyContent={"space-between"}
//         >
//           UPDATE
//           <Stack>
//             <IconButton onClick={handleClose}>
//               <Close />
//             </IconButton>
//           </Stack>
//         </DialogTitle>
//         <DialogContent>
//           <Box marginTop={"40px"}>
//             <form id="submit-form" onSubmit={handleSubmit(submitHandler)}>
//               <Controller
//                 name="closedDate"
//                 control={control}
//                 render={({ field }) => (
//                   <Slider
//                     {...field}
//                     aria-label="Temperature"
//                     value={field.value}
//                     marks={marks}
//                     getAriaValueText={valuetext}
//                     valueLabelDisplay="auto"
//                     shiftStep={1}
//                     step={1}
//                     min={1}
//                     max={length}
//                   />
//                 )}
//               />
//             </form>
//           </Box>
//         </DialogContent >
//         <DialogActions>
//           <Button variant="contained" color="error" onClick={handleClose}>
//             Cancel
//           </Button>
//           <Button
//             color="primary"
//             variant="contained"
//             onClick={() => {
//               setOpenConfirmDialog(true);
//             }}
//             form="submit-form"
//             disabled={loading}
//             startIcon={
//               loading ? <CircularProgress color="info" size={20} /> : null
//             }
//           >
//             {loading ? "Processing..." : "Save"}
//           </Button>
//         </DialogActions>
//         <ConfirmedDialog
//           open={openConfirmDialog}
//           onClose={() => setOpenConfirmDialog(false)}
//           title="Confirm Changes"
//           description="Are you sure you want to save the changes?"
//           onYes={handleConfirmYes}
//         />
//       </Dialog>
//     </>
//   );
// };

// export default ClosedDateDialog;
