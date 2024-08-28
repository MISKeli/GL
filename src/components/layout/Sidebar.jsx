// import React, { Fragment, useEffect, useRef, useState } from "react";
// import "../../styles//layout/SideBar.scss";
// import { Link, useLocation } from "react-router-dom";
// import {
//   Box,
//   Collapse,
//   IconButton,
//   Tooltip,
//   Typography,
//   Zoom,
// } from "@mui/material";
// import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
// import { moduleSchema } from "../../schemas/moduleSchema";
// import logo from "../../assets/images/logo.png";
// import MISLOGO from "../../assets/images/MISLOGO.png";

// const Sidebar = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [activeSubIndex, setActiveSubIndex] = useState(null);
//   const [stepHeight, setStepHeight] = useState(0);
//   const [isDrawerOpen, setIsDrawerOpen] = useState(true);
//   const sidebarRef = useRef();
//   const indicatorRef = useRef();
//   const location = useLocation();
//   // console.log({ activeSubIndex });

//   const navsModule = moduleSchema?.filter(
//     (module) => module.subCategory != null || module.name
//   );

//   useEffect(() => {
//     setTimeout(() => {
//       const sidebarItem = sidebarRef.current.querySelector(".side__item");
//       if (sidebarItem) {
//         indicatorRef.current.style.height = `${sidebarItem.clientHeight}px`;
//         setStepHeight(sidebarItem.clientHeight);
//       }
//     }, 50);
//   }, []);

//   useEffect(() => {
//     // Main Item
//     const curPath = location.pathname.split("/")[1];
//     //console.log({ curPath });
//     const activeItem = navsModule.findIndex((item) => item.section === curPath);
//     setActiveIndex(curPath?.length === 0 ? 0 : activeItem);

//     // Sub Item
//     const subPath = location.pathname.split("/")[2];

//     const activeSubItem = moduleSchema?.[activeItem]?.subCategory?.findIndex(
//       (sub) => sub.section === subPath
//     );
//     setActiveSubIndex(subPath ? activeSubItem : null);
//   }, [location]);

//   return (
//     <Box className="side" data-active={isDrawerOpen}>
//       <Box className="side__container side__container--header">
//         <Box className="side__header">
//           <img src={logo} className="side__logo" alt="side__logo" />
//           <Box className="side__logo-text">General Ledger</Box>
//         </Box>
//         <Box className="side__minimize">
//           <IconButton
//             onClick={() => {
//               setIsDrawerOpen((prev) => !prev);
//             }}
//           >
//             <KeyboardDoubleArrowLeft />
//           </IconButton>
//         </Box>
//       </Box>
//       <Box
//         className="side__container side__container--content"
//         ref={sidebarRef}
//       >
//         <Box>
//           <Box
//             ref={indicatorRef}
//             className="side__indicator"
//             sx={{
//               transform: `translateY(${activeIndex * stepHeight}px)`,
//             }}
//           />
//           {navsModule.map((item, index) => (
//             <Fragment key={index}>
//               <Link
//                 to={item.to}
//                 className="side__link"
//                 onClick={() => {
//                   !!item.subCategory && setIsDrawerOpen(true);
//                 }}
//               >
//                 <Box
//                   className={`side__item ${
//                     activeIndex === index ? "active" : ""
//                   }`}
//                 >
//                   <Tooltip
//                     title={isDrawerOpen ? "" : item.name}
//                     placement="right"
//                     arrow
//                     TransitionComponent={Zoom}
//                     disableHoverListener={isDrawerOpen} // Disable tooltip when sidebar is open
//                   >
//                     <Box className="side__sub-item--icon">
//                       {activeIndex === index ? <item.iconOn /> : <item.icon />}
//                     </Box>
//                   </Tooltip>
//                   <Box className="side__item--name">{item.name}</Box>
//                 </Box>
//               </Link>
//               {item?.subCategory && (
//                 <Collapse in={isDrawerOpen}>
//                   {item?.subCategory?.map((item, subIndex) => {
//                     return (
//                       <Fragment key={subIndex}>
//                         <Link to={item.to} className="side__link">
//                           <Box
//                             className={`side__sub-item ${
//                               activeSubIndex === subIndex ? "active" : ""
//                             }`}
//                           >
//                             <Box className="side__sub-item--name">
//                               {item.name}
//                             </Box>
//                           </Box>
//                         </Link>
//                       </Fragment>
//                     );
//                   })}
//                 </Collapse>
//               )}
//             </Fragment>
//           ))}
//         </Box>
//       </Box>

//       <Box className="side__container side__container--footer">
//         <Box className="side__footer">
//           <img src={MISLOGO} className="footer__logo" alt="footer__logo" />
//         </Box>
//         <Typography variant="caption" className="side__footer-text">
//           Powered By MIS All right reserved
//         </Typography>
//         <Typography variant="caption" className="side__footer-text">
//           Copyrights © 2024
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// export default Sidebar;
import React, { Fragment, useEffect, useRef, useState } from "react";
import "../../styles/layout/SideBar.scss";
import { Link, useLocation } from "react-router-dom";
import {
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { moduleSchema } from "../../schemas/moduleSchema";
import logo from "../../assets/images/logo.png";
import MISLOGO from "../../assets/images/MISLOGO.png";

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [stepHeight, setStepHeight] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const sidebarRef = useRef();
  const indicatorRef = useRef();
  const location = useLocation();

  // Helper function to calculate the height of sidebar items
  const updateStepHeight = () => {
    if (sidebarRef.current) {
      const sidebarItems = sidebarRef.current.querySelectorAll(".side__item");
      if (sidebarItems.length > 0) {
        const firstItemHeight = sidebarItems[0].clientHeight;
        setStepHeight(firstItemHeight);
        indicatorRef.current.style.height = `${firstItemHeight}px`;
      }
    }
  };

  useEffect(() => {
    updateStepHeight();
    window.addEventListener("resize", updateStepHeight);
    return () => {
      window.removeEventListener("resize", updateStepHeight);
    };
  }, []);

  useEffect(() => {
    const curPath = location.pathname.split("/")[1];
    const activeItem = moduleSchema.findIndex(
      (item) => item.section === curPath
    );
    setActiveIndex(curPath?.length === 0 ? 0 : activeItem);

    const subPath = location.pathname.split("/")[2];
    const activeSubItem = moduleSchema[activeItem]?.subCategory?.findIndex(
      (sub) => sub.section === subPath
    );
    setActiveSubIndex(subPath ? activeSubItem : null);
  }, [location]);

  const navsModule = moduleSchema?.filter(
    (module) => module.subCategory || module.name
  );

  return (
    <Box className="side" data-active={isDrawerOpen}>
      <Box className="side__container side__container--header">
        <Box className="side__header">
          <img src={logo} className="side__logo" alt="Company Logo" />
          <Box className="side__logo-text">General Ledger</Box>
        </Box>
        <Box className="side__minimize">
          <IconButton
            aria-label={isDrawerOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setIsDrawerOpen((prev) => !prev)}
          >
            <KeyboardDoubleArrowLeft />
          </IconButton>
        </Box>
      </Box>
      <Box
        className="side__container side__container--content"
        ref={sidebarRef}
      >
        <Box>
          <Box
            ref={indicatorRef}
            className="side__indicator"
            sx={{ transform: `translateY(${activeIndex * stepHeight}px)` }}
          />
          {navsModule.map((item, index) => (
            <Fragment key={index}>
              <Link
                to={item.to}
                className="side__link"
                aria-current={activeIndex === index ? "page" : undefined}
                onClick={() => {
                  if (item.subCategory) setIsDrawerOpen(true);
                }}
              >
                <Box
                  className={`side__item ${
                    activeIndex === index ? "active" : ""
                  }`}
                >
                  <Tooltip
                    title={isDrawerOpen ? "" : item.name}
                    placement="right"
                    arrow
                    TransitionComponent={Zoom}
                    disableHoverListener={isDrawerOpen}
                  >
                    <Box className="side__sub-item--icon">
                      {activeIndex === index ? <item.iconOn /> : <item.icon />}
                    </Box>
                  </Tooltip>
                  <Box className="side__item--name">{item.name}</Box>
                </Box>
              </Link>
              {item.subCategory && (
                <Collapse in={isDrawerOpen}>
                  {item.subCategory.map((subItem, subIndex) => (
                    <Fragment key={subIndex}>
                      <Link to={subItem.to} className="side__link">
                        <Box
                          className={`side__sub-item ${
                            activeSubIndex === subIndex ? "active" : ""
                          }`}
                        >
                          <Box className="side__sub-item--name" >
                            {subItem.name}
                          </Box>
                        </Box>
                      </Link>
                    </Fragment>
                  ))}
                </Collapse>
              )}
            </Fragment>
          ))}
        </Box>
      </Box>
      <Box className="side__container side__container--footer">
        <Box className="side__footer">
          <img src={MISLOGO} className="footer__logo" alt="Footer Logo" />
        </Box>
        <Typography variant="caption" className="side__footer-text">
          Powered By MIS All rights reserved
        </Typography>
        <Typography variant="caption" className="side__footer-text">
          Copyright © 2024
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
