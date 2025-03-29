import React from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderIcon from '@mui/icons-material/Folder'; // For Documents
import PsychologyIcon from '@mui/icons-material/Psychology'; // For Test Chatbot
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutFunction } from '../redux/features/auth/authSlice';

// Add theme colors constant to match Home.jsx
const themeColors = {
  primary: {
    gradient: 'linear-gradient(to right, #4F46E5, #9333EA)',
    hover: 'linear-gradient(to right, #4338CA, #7E22CE)',
  },
  background: {
    paper: 'rgba(255, 255, 255, 0.9)',
    gradient: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  },
  border: 'rgba(145, 158, 171, 0.12)',
  shadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
};

const Sidebar = ({
  open,
  onClose,
  onCreateNewSession,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();
  const dispatch=useDispatch();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (route) => {
    navigate(route);
    if (window.innerWidth < 1024) {
      onClose(); // Close drawer on mobile after navigation
    }
  };


  const handleLogout = () => {
    dispatch(logoutFunction())
    console.log("Successfully logged out")
  }

  const sidebarContent = (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: themeColors.background.paper,
        borderRight: `1px solid ${themeColors.border}`,
        boxShadow: themeColors.shadow,
        backdropFilter: 'blur(6px)',
        zIndex: 1200,
        transition: 'width 0.3s ease-in-out',
        overflow: 'hidden',
        width: isCollapsed ? '80px' : '300px'
      }}
    >
      <Box sx={{
        p: 3,
        borderBottom: `1px solid ${themeColors.border}`,
        background: themeColors.background.gradient,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          {!isCollapsed && (
            <Typography 
              variant="h6" 
              sx={{
                fontWeight: 700,
                background: themeColors.primary.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Vahan Chat
            </Typography>
          )}
          <IconButton
            onClick={() => {
              if (window.innerWidth >= 1024) {
                toggleSidebar();
              } else {
                onClose();
              }
            }}
            sx={{
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.08)',
              }
            }}
          >
            <MenuIcon sx={{ color: '#4F46E5' }} />
          </IconButton>
        </Box>
        
    
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1 }}>
        {[
          { icon: <FolderIcon />, text: 'Documents', path: '/user/document' },
          { icon: <PsychologyIcon />, text: 'Test Chatbot', path: '/' },
          { icon: <BarChartIcon />, text: 'Metrics and Analytics', path: '/metrics' }
        ].map((item, index) => (
          <ListItem key={index} disablePadding>
            <ListItemButton
              onClick={() => handleNavigation(item.path)}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  background: 'rgba(99, 102, 241, 0.08)',
                  '& .MuiSvgIcon-root': {
                    color: '#4F46E5',
                  },
                  '& .MuiTypography-root': {
                    background: themeColors.primary.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }
                },
                transition: 'all 0.3s ease'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {React.cloneElement(item.icon, { sx: { color: '#6B7280' } })}
              </ListItemIcon>
              {!isCollapsed && (
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: 500,
                      color: '#374151',
                    }
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout section */}
      <Box sx={{ 
        p: 2,
        borderTop: `1px solid ${themeColors.border}`,
        background: themeColors.background.gradient,
      }}>
        {!isCollapsed ? (
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            variant="contained"
            sx={{
              background: 'linear-gradient(to right, #EF4444, #DC2626)',
              color: 'white',
              textTransform: 'none',
              borderRadius: '12px',
              py: 1,
              boxShadow: '0 8px 16px -4px rgba(239, 68, 68, 0.2)',
              '&:hover': {
                background: 'linear-gradient(to right, #DC2626, #B91C1C)',
                transform: 'translateY(-2px)',
                boxShadow: '0 12px 20px -4px rgba(239, 68, 68, 0.3)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Logout
          </Button>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              onClick={onLogout}
              sx={{
                width: '48px',
                height: '48px',
                mx: 'auto',
                color: '#EF4444',
                '&:hover': {
                  background: 'rgba(239, 68, 68, 0.08)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box sx={{ 
        display: { xs: 'none', lg: 'block' },
        width: isCollapsed ? 80 : 300,
        flexShrink: 0
      }}>
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{ 
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: 300,
            background: themeColors.background.paper,
            backdropFilter: 'blur(6px)',
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;