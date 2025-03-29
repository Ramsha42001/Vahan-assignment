import { useState,useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { TextField, Button, Paper, Typography, Box, IconButton, InputAdornment ,CircularProgress} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { login,logout } from '../redux/features/auth/authSlice';
import { motion } from 'framer-motion';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const loading = useSelector((state) => state.auth.loading);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(login(formData)); 
    navigate('/user/document'); 
  };

  useEffect(()=>{
    if(localStorage.getItem('token'))
    navigate('/user/home')
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md"
      >
        <Paper className="bg-white p-8 rounded-xl shadow-xl">
          <div className="text-center space-y-3 mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 bg-purple-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-md">
                <Lock className="text-white text-3xl" />
              </div>
            </motion.div>
            <Typography variant="h5" className="text-blue-900 font-semibold tracking-wide">
              Welcome Back
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Enter your credentials to access your account
            </Typography>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              fullWidth
              required
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              helperText="We'll never share your email with anyone else"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: 'gray' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&:hover fieldset': {
                    borderColor: 'gray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'purple',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'gray',
                  '&.Mui-focused': {
                    color: 'purple',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: 'gray',
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              helperText="Password must be at least 8 characters long"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'gray' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                      sx={{ color: 'gray' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'lightgray',
                  },
                  '&:hover fieldset': {
                    borderColor: 'gray',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'purple',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'gray',
                  '&.Mui-focused': {
                    color: 'purple',
                  },
                },
                '& .MuiFormHelperText-root': {
                  color: 'gray',
                },
              }}
            />

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-semibold"
                sx={{ textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : "Sign In"}
              </Button>
            </motion.div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col space-y-4 text-center">
              <Typography variant="body2" className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-purple-600 hover:text-purple-700 font-semibold"
                >
                  Sign Up
                </Link>
              </Typography>
            </div>
          </div>
        </Paper>
      </motion.div>
    </div>
  );
};

export default Login;