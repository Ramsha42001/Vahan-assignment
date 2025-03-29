import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Fade,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDispatch, useSelector } from 'react-redux';
import { createDocument, deleteDocument, listDocuments } from '../redux/features/document/documentSlice';
import { alpha } from '@mui/material/styles';

const Documents = () => {
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();

  const { documents: { documents: documentsList = [] } = {}, loading: documentsLoading, error } = useSelector((state) => state.documents || {});

  useEffect(() => {
   
    fetchDocuments();
  }, [dispatch]);

  const fetchDocuments = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await dispatch(listDocuments(token));
      } catch (err) {
        console.error('Error fetching documents:', err);
      }
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      await dispatch(createDocument({ documentData: formData, token }));
      setOpenUploadDialog(false);
      setSelectedFile(null);
      setOpenUploadDialog(false);
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      if (window.confirm('Are you sure you want to delete the document?')) {
        console.log('Deleting document:', filename); // Debug log
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        await dispatch(deleteDocument(filename));
        console.log('Document deleted successfully'); // Debug log
        await fetchDocuments(); // Refresh the list after successful deletion
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Box className="p-8 bg-gradient-to-br from-gray-50 to-purple-50 min-h-screen">
      <Box className="max-w-7xl mx-auto">
        <Box className="flex justify-between items-center mb-8">
          <Box>
            <Typography 
              variant="h4" 
              className="text-gray-800 font-bold tracking-tight"
              sx={{
                background: 'linear-gradient(to right, #4F46E5, #9333EA)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              My Documents
            </Typography>
            <Typography variant="subtitle1" className="text-gray-500 mt-1">
              Manage and organize your files in one place
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenUploadDialog(true)}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              py: 1.5,
              px: 4,
              background: 'linear-gradient(to right, #4F46E5, #9333EA)',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(to right, #4338CA, #7E22CE)',
                transform: 'translateY(-2px)',
                boxShadow: '0 15px 20px -3px rgba(99, 102, 241, 0.4)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Upload Document
          </Button>
        </Box>

        <Fade in={true}>
          <Paper 
            elevation={0}
            sx={{
              p: 4,
              borderRadius: '16px',
              border: '1px solid',
              borderColor: 'rgba(145, 158, 171, 0.12)',
              boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)',
              background: alpha('#fff', 0.9),
              backdropFilter: 'blur(6px)'
            }}
          >
            {documentsLoading ? (
              <Box className="py-16 text-center">
                <CircularProgress sx={{ color: '#6366F1' }} />
              </Box>
            ) : error ? (
              <Box className="py-16 text-center">
                <Typography color="error">Error loading documents: {error}</Typography>
              </Box>
            ) : documentsList.length === 0 ? (
              <Box className="py-16 text-center">
                <CloudUploadIcon sx={{ fontSize: 80, color: '#E0E7FF' }} className="mb-4" />
                <Typography className="text-gray-500 text-lg">
                  No documents uploaded yet
                </Typography>
                <Typography className="text-gray-400 mt-2">
                  Start by uploading your first document!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">File Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Upload Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Size</th>
                      {/* <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider border-b">Actions</th> */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {documentsList.map((doc) => (
                      <tr 
                        key={doc.filename} 
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Box 
                              sx={{
                                p: 1,
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                                mr: 2
                              }}
                            >
                              <DescriptionIcon sx={{ color: '#4F46E5' }} />
                            </Box>
                            <Typography className="text-sm font-medium text-gray-900">
                              {doc.filename}
                            </Typography>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Typography className="text-sm text-gray-600">
                            {new Date(doc.upload_date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </td>
                        <td className="px-6 py-4">
                          <Box 
                            sx={{
                              display: 'inline-block',
                              px: 2,
                              py: 0.5,
                              borderRadius: '6px',
                              bgcolor: '#F3F4F6',
                              color: '#4B5563',
                              fontSize: '0.875rem'
                            }}
                          >
                            {(doc.size / 1024).toFixed(2)} KB
                          </Box>
                        </td>

                        {/* <td className="px-6 py-4 text-right">
                          <IconButton
                            onClick={() => handleDelete(doc.filename)}
                            sx={{
                              color: '#9CA3AF',
                              '&:hover': {
                                bgcolor: alpha('#EF4444', 0.08),
                                color: '#EF4444'
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </td> */}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Paper>
        </Fade>

        <Dialog
          open={openUploadDialog}
          onClose={() => setOpenUploadDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }
          }}
        >
          <DialogTitle 
            sx={{
              background: 'linear-gradient(to right, #4F46E5, #9333EA)',
              color: 'white',
              px: 4,
              py: 3
            }}
          >
            Upload New Document
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Box className="mt-4 text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-8 py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-500 transition-all duration-200"
              >
                <CloudUploadIcon sx={{ mr: 2, color: '#6366F1' }} />
                <Typography>
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </Typography>
              </label>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#F9FAFB' }}>
            <Button
              onClick={() => setOpenUploadDialog(false)}
              disabled={loading}
              sx={{
                color: '#4B5563',
                '&:hover': { bgcolor: '#F3F4F6' },
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || loading}
              sx={{
                minWidth: '100px',
                borderRadius: '8px',
                textTransform: 'none',
                background: 'linear-gradient(to right, #4F46E5, #9333EA)',
                '&:hover': {
                  background: 'linear-gradient(to right, #4338CA, #7E22CE)',
                },
                '&.Mui-disabled': {
                  background: '#E5E7EB',
                  color: '#9CA3AF'
                }
              }}
            >
              {loading ? (
                <>
                  <CircularProgress 
                    size={20} 
                    sx={{ 
                      color: 'white',
                      mr: 1 
                    }}
                  />
                 Document being uploaded and processed for chatbot 
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Documents;
