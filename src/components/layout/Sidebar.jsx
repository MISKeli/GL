import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "../../styles/layout/SideBar.scss";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user"));
  const AccessPermission = user.permission || [];

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

  // Memoize filtered module schema for better performance
  const navsModule = useMemo(() => {
    return moduleSchema
      ?.filter((module) => module.subCategory || module.name)
      ?.filter((item) => AccessPermission.includes(item.name));
  }, [AccessPermission]);

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

  const handleSubCatClick = (subIndex) => {
    setActiveSubIndex(subIndex); // Set active subcategory on click
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
                      {item.subCategory.map((subItem, subIndex) =>
                        AccessPermission.includes(subItem.name) ? (
                          <Fragment key={subIndex}>
                            <Link
                              to={subItem.to || "#"}
                              className="side__link"
                              onClick={() => handleSubCatClick(subIndex)} // Handle subcategory click
                            >
                              <Box
                                className={`side__sub-item ${
                                  activeSubIndex === subIndex ? "active" : ""
                                }`}
                              >
                                {activeSubIndex === subIndex ? (
                                  <subItem.iconOn />
                                ) : (
                                  <subItem.icon />
                                )}
                                <Box className="side__sub-item--name">
                                  {subItem.name}
                                </Box>
                              </Box>
                            </Link>
                          </Fragment>
                        ) : null
                      )}
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
