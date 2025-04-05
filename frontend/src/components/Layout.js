import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppBar, Box, CssBaseline, IconButton, Toolbar, Typography, useTheme, Menu, MenuItem, Button, useMediaQuery, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from "@mui/material";
import { Menu as MenuIcon, TextFields, Image, PictureAsPdf, Code, Folder, Movie, Language, DataObject, Security, Home } from "@mui/icons-material";

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: "Home", icon: <Home />, path: "/" },
  { text: "PDF Tools", icon: <PictureAsPdf />, path: "/pdf-tools" },
  { text: "Media Tools", icon: <Movie />, path: "/media-tools" },
  { text: "Image Tools", icon: <Image />, path: "/image-tools" },
  { text: "Text Tools", icon: <TextFields />, path: "/text-tools" },
  { text: "Developer Tools", icon: <Code />, path: "/developer-tools" },
  { text: "File Tools", icon: <Folder />, path: "/file-tools" },
  { text: "Web Tools", icon: <Language />, path: "/web-tools" },
  { text: "Data Tools", icon: <DataObject />, path: "/data-tools" },
  { text: "Privacy Tools", icon: <Security />, path: "/privacy-tools" }
];

function Layout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
    const theme = useTheme();
    const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
      handleMobileMenuClose();
    }
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

    const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <img
          src="/logo192.png.png"
          alt="All Web Tool"
          style={{
            width: "40px",
            height: "40px",
            marginRight: "8px",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            background: "linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
          }}
        >
          All Web Tool
                </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem
                        key={item.text}
            disablePadding
            sx={{
              mb: 0.5,
              mx: 1,
              position: "relative",
            }}
          >
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              selected={isActive(item.path)}
              sx={{
                borderRadius: 1,
                "&.Mui-selected": {
                  backgroundColor: "rgba(78, 205, 196, 0.1)",
                  "&:hover": {
                    backgroundColor: "rgba(78, 205, 196, 0.15)",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "#4ECDC4",
                  },
                  "& .MuiListItemText-primary": {
                    color: "#4ECDC4",
                    fontWeight: "bold",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "4px",
                    height: "70%",
                    backgroundColor: "#4ECDC4",
                    borderRadius: "0 4px 4px 0",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive(item.path) ? "#4ECDC4" : "inherit",
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    color: isActive(item.path) ? "#4ECDC4" : "inherit",
                    fontWeight: isActive(item.path) ? "bold" : "normal",
                  },
                }}
              />
            </ListItemButton>
                    </ListItem>
                ))}
            </List>
    </Box>
    );

    return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <CssBaseline />
      {isMobile && (
            <AppBar
                position="fixed"
                sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            bgcolor: "background.paper",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {menuItems.find(item => item.path === location.pathname)?.text || 'Home'}
                    </Typography>
                </Toolbar>
            </AppBar>
      )}

            <Box
                component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
            keepMounted: true,
                    }}
                    sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              bgcolor: "background.paper",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: isMobile ? "64px" : 0,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default Layout; 
