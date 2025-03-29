import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { websocketConnect, websocketDisconnect } from '../redux/features/webSocket/webSocketSlice';
// Material UI imports
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  Avatar,
  Slide,
  Dialog,
  DialogContent
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import { motion } from 'framer-motion';
import Sidebar from '../components/sidebar';
import LockIcon from '@mui/icons-material/Lock';

// Enhanced styled components with more modern and appealing styles
const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: '1px solid rgba(0, 123, 255, 0.1)',
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 2px 15px rgba(0, 0, 0, 0.03)',
}));

const MessageContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.03)',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(45deg, #007bff, #0056b3)',
    borderRadius: '10px',
    '&:hover': {
      background: 'linear-gradient(45deg, #0056b3, #003980)',
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, sender }) => ({
  maxWidth: '70%',
  padding: theme.spacing(2, 3),
  borderRadius: sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  position: 'relative',
  marginLeft: sender === 'user' ? 'auto' : '0',
  marginRight: sender === 'user' ? '0' : 'auto',
  background: sender === 'user'
    ? 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
    : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  color: sender === 'user' ? '#fff' : '#333',
  boxShadow: '0 3px 15px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.12)',
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
  borderTop: '1px solid rgba(0, 123, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 -2px 15px rgba(0, 0, 0, 0.03)',
}));

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newSessionAnimation, setNewSessionAnimation] = useState(false);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const dispatch = useDispatch();
  const socketRef = useRef(null); // Reference to the WebSocket
  const [isThinking, setIsThinking] = useState(false);  // Add this new state
  const suggestionQueries = [
    'What is the price of a Pink T-shirt?',
    'Tell me about the available sizes for blue jeans.',
    'Do you have any discounts on red shoes?',
    'How much does a black leather jacket cost?',
  ];

  // Check for token validity
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOpenLoginDialog(true);
    }
  }, []);

  // Load initial data from localStorage or query params
    useEffect(() => {
        const loadInitialData = () => {
            const sessionIdFromQuery = new URLSearchParams(location.search).get('session_id');

            if (sessionIdFromQuery) {
                const newSession = {
                    id: sessionIdFromQuery,
                    name: `Customer Support Chatbot`,
                    createdAt: new Date().toISOString()
                };
                setCurrentSession(newSession);
                 // Load messages for the session from localStorage
                const savedMessages = JSON.parse(localStorage.getItem(`messages_${sessionIdFromQuery}`) || '[]');
                setMessages(savedMessages);
                dispatch(websocketConnect(`wss://your-websocket-url/api/chat?session_id=${sessionIdFromQuery}`));
            }
        };

        loadInitialData();
    }, [location.search, dispatch]);

  // Add a dependency array to prevent infinite re-renders
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);



  // Load messages for the current session
  useEffect(() => {
    if (currentSession) {
      // Connect to WebSocket when the component mounts
      socketRef.current = new WebSocket(`wss://shastra-service-410805250566.us-central1.run.app/api/chat?session_id=${currentSession.id}`);

      socketRef.current.onopen = () => {
        console.log('WebSocket connection established');
      };

      socketRef.current.onmessage = (event) => {
        let newMessage;

        // Try to parse the incoming message as JSON
        try {
          newMessage = JSON.parse(event.data);
        } catch (error) {
          console.warn('Received non-JSON message:', event.data); // Log the non-JSON message
          newMessage = { content: event.data, sender: 'ai', timestamp: new Date().toISOString() }; // Create a message object
        }

        console.log('Received message:', newMessage); // Log the incoming message
        setMessages((prevMessages) => [...prevMessages, newMessage]); // Update state with the new message
        setIsThinking(false); // Stop loading indicator when response received
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error); // Log any errors
      };

      socketRef.current.onclose = () => {
        console.log('WebSocket connection closed');
      };

      // Cleanup function to disconnect when the component unmounts
      return () => {
        if (socketRef.current) {
          socketRef.current.close();
        }
      };
    }
  }, [currentSession]);

  const createNewSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setOpenLoginDialog(true);
      return;
    }

    try {
      const randomSessionId = `session_${Math.random().toString(36).substr(2, 9)}`; // Generate a random session ID
      setNewSessionAnimation(true);

      const newSession = {
        id: randomSessionId,
        name: `Customer Support Chatbot`,
        createdAt: new Date().toISOString()
      };

      setCurrentSession(newSession);
      setMessages([]);

      // Save to localStorage
      localStorage.setItem(`messages_${newSession.id}`, JSON.stringify([]));

      // Connect to WebSocket
      dispatch(websocketConnect(`wss://your-websocket-url/api/chat?session_id=${randomSessionId}`));



      setTimeout(() => {
        setNewSessionAnimation(false);
      }, 1000);
    } catch (error) {
      console.error('Error creating new session:', error);
      setNewSessionAnimation(false);
    }
  };

  // Ensure handleLogout and formatDate are defined
  const handleLogout = () => {
    dispatch(logout)
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const userMessage = {
      id: Date.now(),
      content: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsThinking(true); // Start loading indicator

    // Send the message to the WebSocket
    if (socketRef.current) {
      socketRef.current.send(JSON.stringify(userMessage));
    }

    localStorage.setItem(`messages_${currentSession.id}`, JSON.stringify(updatedMessages));
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    sendMessage({ preventDefault: () => {} }); // Simulate form submission
  };

  // Add this new component for the thinking indicator
  const ThinkingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <MessageBubble sender="ai">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} thickness={5} sx={{ color: '#666' }} />
          <Typography sx={{ color: '#666' }}>Thinking...</Typography>
        </Box>
      </MessageBubble>
    </motion.div>
  );

  return (
      <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-blue-50 to-white">

      {/* Main Content - ChatGPT-like Interface */}
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col h-screen relative"
      >
        {/* Menu Button for Mobile */}
        <IconButton
          className="block lg:hidden absolute top-4 left-4 z-50"
          onClick={() => setSidebarOpen(true)}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            display: { lg: 'none' }
          }}
        >
          <MenuIcon sx={{ color: '#007bff' }} /> // Blue icon
        </IconButton>

        {currentSession ? (
          <Box className="flex flex-col h-full">
            <ChatHeader>
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-3 ml-14 lg:ml-0"> {/* Add margin-left for mobile */}
                  <Avatar
                    sx={{
                      bgcolor: 'transparent',
                      background: '#007bff', // Blue background
                      color: 'white',
                    }}
                  >
                    Chat
                  </Avatar>
                  <Box>
                    <Typography variant="h6" className="font-bold text-gray-800">
                      Customer Support Chatbot
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ChatHeader>

            <MessageContainer>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <MessageBubble sender={message.sender}>
                    <Typography>{message.content}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                        display: 'block',
                        textAlign: message.sender === 'user' ? 'right' : 'left',
                        mt: 1
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </MessageBubble>
                </motion.div>
              ))}
              {isThinking && <ThinkingIndicator />}
              <div ref={messageEndRef} />
            </MessageContainer>

            <InputContainer>
              <form onSubmit={sendMessage} className="flex gap-2">
                <TextField
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  fullWidth
                  variant="outlined"
                  size="medium"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 1)',
                      },
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                        borderWidth: '1px',
                      },
                      '&:hover fieldset': {
                        borderColor: '#c2c2c2',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#007bff',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '14px 16px',
                      fontSize: '1rem',
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  className="bg-blue-500 hover:bg-blue-600" // Blue button
                  sx={{
                    borderRadius: '12px',
                    minWidth: '120px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    padding: '12px 24px',
                    '&:hover': {
                      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                  endIcon={<SendIcon />}
                >
                  Send
                </Button>
              </form>
            </InputContainer>
          </Box>
        ) : (
          <Box className="flex-1 flex items-center justify-center p-8 flex-col">
            {/* Add margin-top for mobile view to account for menu button */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-12"
            >
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  margin: '0 auto 32px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  boxShadow: '0 8px 25px rgba(0, 123, 255, 0.2)',
                }}
              >
                <ChatBubbleOutlineIcon sx={{ fontSize: 50, color: 'white' }} />
              </Avatar>
              <Typography 
                variant="h3" 
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                  marginBottom: 2
                }}
              >
                Welcome to Vahan Chatbot
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666',
                  maxWidth: '600px',
                  margin: '0 auto',
                  lineHeight: 1.6
                }}
              >
                Your AI-powered assistant for all product-related queries
              </Typography>
              
              <Button
                onClick={createNewSession}
                variant="contained"
                sx={{
                  mt: 6,
                  mb: 8,
                  py: 2,
                  px: 6,
                  borderRadius: '30px',
                  background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(0, 123, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 30px rgba(0, 123, 255, 0.3)',
                  }
                }}
                startIcon={<AddIcon />}
              >
                Start New Conversation
              </Button>
              
              {/* Enhanced suggestion buttons */}
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    color: '#555',
                    fontWeight: 600
                  }}
                >
                  Popular Queries
                </Typography>
                <Box 
                  className="flex flex-wrap gap-3 justify-center"
                  sx={{ maxWidth: '800px', margin: '0 auto' }}
                >
                  {suggestionQueries.map((suggestion, index) => (
                    <Button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{
                        borderRadius: '20px',
                        border: '2px solid rgba(0, 123, 255, 0.1)',
                        padding: '10px 20px',
                        color: '#007bff',
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: '2px solid rgba(0, 123, 255, 0.3)',
                          boxShadow: '0 5px 15px rgba(0, 123, 255, 0.1)',
                        }
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </Box>
              </Box>
            </motion.div>
          </Box>
        )}
        </motion.div>

      {/* Login Dialog */}
      <Dialog
        open={openLoginDialog}
        disableEscapeKeyDown
        PaperProps={{
          style: {
            width: '400px',
            borderRadius: '16px',
            padding: '24px',
            background: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogContent sx={{
          textAlign: 'center',
          padding: '32px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3
        }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              backgroundColor: 'transparent',
              background: '#007bff', // Blue
              marginBottom: 2
            }}
          >
            <LockIcon sx={{ fontSize: 35, color: 'white' }} />
          </Avatar>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: 1
            }}
          >
            Authentication Required
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              marginBottom: 3,
              maxWidth: '280px'
            }}
          >
            Please log in to access the chat features and start your conversation
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            fullWidth
            sx={{
              background: '#007bff',
              color: 'white',
              padding: '12px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              '&:hover': {
                background: '#0056b3',
                transform: 'translateY(-1px)',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            Login to Continue
          </Button>
        </DialogContent>
      </Dialog>
      </div>
  );
};

export default Home;