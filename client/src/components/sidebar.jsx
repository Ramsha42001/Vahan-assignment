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

const Sidebar = ({
  open,
  onClose,
  onCreateNewSession,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (route) => {
    navigate(route);
    if (window.innerWidth < 1024) {
      onClose(); // Close drawer on mobile after navigation
    }
  };

  const sidebarContent = (
    <Box
      className={`fixed top-0 left-0 h-full flex flex-col bg-white border-r border-gray-200 shadow-md z-1200 transition-width duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-80'
      }`}
    >
      <Box className="bg-gray-100 border-b border-gray-200 p-4 flex flex-col gap-2">
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6" className={`font-bold text-blue-900 ${isCollapsed ? 'hidden' : 'block'}`} align="center">
            <strong>Vahan Chat</strong>
          </Typography>
          <IconButton
            onClick={() => {
              if (window.innerWidth >= 1024) {
                toggleSidebar();
              } else {
                onClose();
              }
            }}
            className="cursor-pointer"
          >
            <MenuIcon color="primary" />
          </IconButton>
        </Box>
        {!isCollapsed && (
          <Button
            onClick={onCreateNewSession}
            fullWidth
            variant="contained"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-sm transition-all duration-200"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            New Conversation
          </Button>
        )}
        {isCollapsed && (
          <Tooltip title="New Conversation" placement="right">
            <IconButton
              onClick={onCreateNewSession}
              className="w-12 h-12 mx-auto bg-purple-600 rounded-full text-white hover:bg-purple-700 shadow-md"
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Menu Items */}
      <List className="flex-grow">
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/user/document')}>
            <ListItemIcon>
              <FolderIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Documents" className={isCollapsed ? 'hidden' : ''} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/')}> {/* Assuming '/' is your test chatbot route */}
            <ListItemIcon>
              <PsychologyIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Test Chatbot" className={isCollapsed ? 'hidden' : ''} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavigation('/metrics')}>
            <ListItemIcon>
              <BarChartIcon color="primary" />
            </ListItemIcon>
            <ListItemText primary="Metrics and Analytics" className={isCollapsed ? 'hidden' : ''} />
          </ListItemButton>
        </ListItem>
      </List>

      {/* Logout section at the bottom */}
      <Box className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <Button
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            fullWidth
            variant="contained"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md shadow-sm transition-all duration-200"
            sx={{ textTransform: 'none' }}
          >
            Logout
          </Button>
        ) : (
          <Tooltip title="Logout" placement="right">
            <IconButton
              onClick={onLogout}
              className="w-12 h-12 mx-auto text-red-500"
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
      <Box className="hidden lg:block" sx={{ width: isCollapsed ? 80 : 300, flexShrink: 0 }}>
        {sidebarContent}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        className="lg:hidden"
        PaperProps={{
          sx: {
            width: 300,
            background: 'white',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;