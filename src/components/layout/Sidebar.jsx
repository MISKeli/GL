import { KeyboardDoubleArrowLeft } from "@mui/icons-material";
import {
  Box,
  Collapse,
  IconButton,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRememberQueryParams } from "../../hooks/useRememberQueryParams";
import logo from "../../assets/images/logo.png";
import MISLOGO from "../../assets/images/MISLOGO.png";
import { useGetAllSystemsAsyncQuery } from "../../features/api/systemApi";
import { moduleSchema } from "../../schemas/moduleSchema";
import "../../styles/layout/SideBar.scss";

const Sidebar = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSubIndex, setActiveSubIndex] = useState(null);
  const [stepHeight, setStepHeight] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const sidebarRef = useRef();
  const indicatorRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const [queryParams, setQueryParams, removeQueryParams] =
    useRememberQueryParams();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const AccessPermission = user.permission || [];

  const { data: systemData } = useGetAllSystemsAsyncQuery({
    UsePagination: false,
  });

  const updateStepHeight = () => {
    if (sidebarRef.current) {
      const sidebarItems = sidebarRef.current.querySelectorAll(".side__item");
      if (sidebarItems.length > 0) {
        const firstItemHeight = sidebarItems[0].clientHeight;
        setStepHeight(firstItemHeight);
        if (indicatorRef.current) {
          indicatorRef.current.style.height = `${firstItemHeight}px`;
        }
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

  const navsModule = useMemo(() => {
    // Map systemData to create subcategories
    const systemNames =
      systemData?.value?.result?.map((item) => {
        const bookParams = item?.bookParameter
          ? typeof item?.bookParameter === "string"
            ? JSON.parse(item?.bookParameter)
            : []
          : [];
        return {
          name: item.systemName,
          bookParameter: bookParams,
          section: item.systemName, // Convert to a valid section name
          // icon: Edit, // Default icon (can be changed)
          // iconOn: DesktopMacTwoTone,
          icon:
            item.iconUrl ??
            "https://10.10.13.5:5004/icons/c0447852-d92e-463e-9397-edd52d6c09b2.svg",
          iconOn:
            item.iconUrl ??
            "https://10.10.13.5:5004/icons/c0447852-d92e-463e-9397-edd52d6c09b2.svg",
          isServerIcon: true,
          to: `/system/${item.systemName}`,
        };
      }) || [];
    // Map moduleSchema and update System module
    const updatedModuleSchema = moduleSchema
      .map((module) => {
        //console.log("mod", module);
        if (module.section === "system") {
          return {
            ...module,
            subCategory: systemNames, // Assign dynamic subCategory
          };
        }

        return module;
      })
      .slice(0, -1);
    // Filter the final nav modules based on access permissions
    return updatedModuleSchema
      ?.filter((module) => module.subCategory || module.name)
      ?.filter((item) => AccessPermission.includes(item.name));
  }, [systemData, AccessPermission]);

  useEffect(() => {
    const curPath = location.pathname.split("/")[1];
    const activeItem = navsModule.findIndex((item) => item.section === curPath);
    setActiveIndex(curPath?.length === 0 ? 0 : activeItem); // Set active index based on pathname

    const subPath = location.pathname.split("/")[2];
    const activeSubItem = navsModule[activeItem]?.subCategory?.findIndex(
      (sub) => sub.section === subPath
    );
    setActiveSubIndex(subPath ? activeSubItem : null);
  }, [location]);

  const handleMainCatClick = useCallback(
    (item, index) => {
      setIsDrawerOpen(true);
      if (item.subCategory) {
        setActiveIndex(index);
        setActiveSubIndex(null);
      } else {
        navigate(item.to || "");
      }
    },
    [navigate]
  );

  const handleSubCatClick = (event, subItem, subIndex) => {
    event.preventDefault();

    // Navigate directly to the subcategory
    setActiveSubIndex(subIndex);
    navigate(subItem.to || "#");
  };

  const popperModifiers = useMemo(
    () => [
      {
        name: "offset",
        options: {
          offset: [0, 30],
        },
      },
    ],
    []
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
              {AccessPermission.includes(item.name) && (
                <Fragment>
                  <Box
                    className="side__link"
                    aria-current={activeIndex === index ? "page" : undefined}
                    onClick={() => handleMainCatClick(item, index)}
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
                        slotProps={{
                          popper: { modifiers: popperModifiers },
                        }}
                      >
                        <Box className="side__sub-item--icon">
                          {activeIndex === index ? (
                            <item.iconOn />
                          ) : (
                            <item.icon />
                          )}
                        </Box>
                      </Tooltip>
                      <Box className="side__item--name">{item.name}</Box>
                    </Box>
                  </Box>
                  {item.subCategory && (
                    <Collapse in={activeIndex === index && isDrawerOpen}>
                      {item.subCategory.map((subItem, subIndex) => {
                        return AccessPermission.includes(subItem.name) ? (
                          <Fragment key={subIndex}>
                            <Box
                              className="side__link"
                              onClick={(event) =>
                                handleSubCatClick(event, subItem, subIndex)
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <Box
                                className={`side__sub-item ${
                                  activeSubIndex === subIndex ? "active" : ""
                                }`}
                              >
                                {/* Render SubCategory Icons */}
                                {subItem.isServerIcon ? (
                                  <img
                                    src={subItem.icon}
                                    alt={subItem.name}
                                    style={{ width: "24px" }}
                                  />
                                ) : subItem.icon ? (
                                  React.createElement(
                                    activeSubIndex === subIndex
                                      ? subItem.iconOn || subItem.icon
                                      : subItem.icon,
                                    { fontSize: "medium" }
                                  )
                                ) : null}

                                {/* SubCategory Name */}
                                <Box className="side__sub-item--name">
                                  {subItem.name}
                                </Box>
                              </Box>
                            </Box>
                          </Fragment>
                        ) : null;
                      })}
                    </Collapse>
                  )}
                </Fragment>
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
