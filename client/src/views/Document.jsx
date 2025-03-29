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
import { createDocument, listDocuments } from '../redux/features/document/documentSlice';

const Documents = () => {
  const [openUploadDialog, setOpenUploadDialog] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();

  // // Get documents from Redux state
  // const documents = useSelector((state) => state.documents?.documents.documents|| []);
  const documents=[]

  const state = useSelector((state) => state);
  console.log(state);

  useEffect(() => {
    const token = localStorage.getItem('token');
    dispatch(listDocuments(token)); // Fetch documents on component mount
  }, [dispatch]);

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
      // Optionally, you can re-fetch documents here if needed
      dispatch(listDocuments(token));
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch(listDocuments(localStorage.getItem('token'))); // Re-fetch documents after deletion
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  return (
    <Box className="p-8 bg-gray-50 min-h-screen">
      <Box className="max-w-7xl mx-auto">
        <Box className="flex justify-between items-center mb-8">
          <Typography variant="h4" className="text-gray-800 font-bold tracking-tight">
            My Documents
          </Typography>
          <Button
            variant="contained"
            startIcon={<UploadFileIcon />}
            onClick={() => setOpenUploadDialog(true)}
            className="bg-purple-600 hover:bg-purple-700 shadow-lg transform transition-transform duration-200 hover:scale-105"
            sx={{ borderRadius: '10px', textTransform: 'none', py: 1.5, px: 3 }}
          >
            Upload Document
          </Button>
        </Box>

        <Fade in={true}>
          <Paper elevation={3} className="p-6 rounded-xl bg-white shadow-md">
            {documents.length === 0 ? (
              <Box className="py-16 text-center">
                <CloudUploadIcon sx={{ fontSize: 64 }} className="text-gray-300 mb-4" />
                <Typography className="text-gray-500 text-lg">
                  No documents uploaded yet. Start by uploading your first document!
                </Typography>
              </Box>
            ) : (
              <List className="divide-y divide-gray-100">
                {documents.map((doc) => (
                  <ListItem
                    key={doc.id}
                    className="py-6 transition-colors duration-150 hover:bg-gray-50 rounded-lg"
                  >
                    <Box className="flex items-center gap-4 flex-1">
                      <Box className="p-3 bg-purple-100 rounded-lg">
                        <DescriptionIcon className="text-purple-600" />
                      </Box>
                      <Box className="flex-1">
                        <Typography variant="h6" className="font-semibold text-gray-900">
                          {doc.name}
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mt-1">
                          Uploaded on {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                      <Tooltip title="Delete document">
                        <IconButton
                          onClick={() => handleDelete(doc.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Fade>

        <Dialog 
          open={openUploadDialog} 
          onClose={() => setOpenUploadDialog(false)}
          PaperProps={{
            className: 'rounded-xl',
            elevation: 24
          }}
        >
          <DialogTitle className="bg-purple-600 text-white px-6 py-4">
            Upload New Document
          </DialogTitle>
          <DialogContent className="p-6">
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
                className="cursor-pointer inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors duration-200"
              >
                <CloudUploadIcon className="mr-2" />
                <Typography>
                  {selectedFile ? selectedFile.name : 'Choose a file'}
                </Typography>
              </label>
            </Box>
          </DialogContent>
          <DialogActions className="p-4 bg-gray-50">
            <Button 
              onClick={() => setOpenUploadDialog(false)} 
              className="text-gray-600 hover:bg-gray-100"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || loading}
              className="bg-purple-600 hover:bg-purple-700"
              sx={{ borderRadius: '8px', textTransform: 'none' }}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default Documents;
