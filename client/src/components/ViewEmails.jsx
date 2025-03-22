import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, styled, IconButton, Divider, Paper } from '@mui/material';
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { ArrowBack, Delete, Label, Archive, Report } from '@mui/icons-material';
import { emptyProfilePic } from '../assests/Assest';
import Emailbody from './Emailbody';
import { emailContext } from "../App";

const API_URL = "http://localhost:5000";

const ViewEmails = () => {
    const { emails, setEmails, accessToken } = useContext(emailContext);
    const { state } = useLocation();
    const { email: initialEmail } = state || {};
    const { openDrawer } = useOutletContext();
    const navigate = useNavigate();
    
    // Local state to store email and body separately
    const [email, setEmail] = useState(initialEmail);
    const [emailBody, setEmailBody] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Fetch email body when component mounts
    useEffect(() => {
        if (email?.email_id && !emailBody) {
            const fetchEmailBody = async () => {
                setLoading(true);
                try {
                    console.log("Fetching email body for ID:", email.email_id);

                    const response = await axios.get(`${API_URL}/fetch-email/${email.email_id}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    console.log("API Response:", response.data);
                    
                    if (response.data?.email?.body) {
                        setEmailBody(response.data.email.body);
                    } else if (response.data?.body) {
                        setEmailBody(response.data.body);
                    } else {
                        console.error("No email body in response");
                    }
                } catch (error) {
                    console.error("Error fetching email body:", error);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchEmailBody();
        } else {
            setLoading(false);
        }
    }, [email, emailBody, accessToken]);
    
    const deleteEmail = () => {
        if (!email?._id) return;
        setEmails((prevEmails) => prevEmails.filter((e) => e._id !== email._id));
        navigate(-1);
    };

    if (!email) {
        return (
            <EmptyStateWrapper>
                <Typography variant="h6">No email selected</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Select an email from your inbox to view its content here.
                </Typography>
                <Button onClick={() => navigate(-1)}>
                    Return to Inbox
                </Button>
            </EmptyStateWrapper>
        );
    }
    
    // Extract sender name from email
    const senderName = getSenderName(email.sender || '');
    
    // Determine sender category/type (for badge display)
    const senderCategory = email.category || 'Inbox';
    
    return (
        <Wrapper 
            style={{
                marginLeft: openDrawer ? 250 : 0, 
                width: '100%',
                transition: 'margin-left 0.3s'
            }}
        >
            <ToolbarContainer>
                <LeftToolbar>
                    <IconButton onClick={() => navigate(-1)} size="medium">
                        <ArrowBack />
                    </IconButton>
                    <IconButton size="medium">
                        <Label />
                    </IconButton>
                    <IconButton size="medium">
                        <Archive />
                    </IconButton>
                </LeftToolbar>
                <RightToolbar>
                    <IconButton onClick={deleteEmail} size="medium">
                        <Delete />
                    </IconButton>
                    <IconButton size="medium">
                        <Report />
                    </IconButton>
                </RightToolbar>
            </ToolbarContainer>
            
            <Divider sx={{ mb: 3 }} />
            
            <ContentContainer>
                <SubjectWrapper>
                    <SubjectText variant="h4">{email.subject || 'No subject'}</SubjectText>
                    <CategoryBadge category={senderCategory}>{senderCategory}</CategoryBadge>
                </SubjectWrapper>

                <SenderInfo>
                    <ProfileImage src={emptyProfilePic} alt="profile" />
                    <SenderDetails>
                        <SenderNameRow>
                            <SenderName>{senderName}</SenderName>
                        </SenderNameRow>
                        <Typography variant="caption" color="textSecondary">
                            {new Date(email.date || Date.now()).toLocaleString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric'
                            })}
                        </Typography>
                    </SenderDetails>
                </SenderInfo>

                <EmailBodyContainer elevation={0}>
                    {loading ? (
                        <LoadingText>Loading email content...</LoadingText>
                    ) : emailBody ? (
                        <Emailbody email={{ ...email, body: emailBody }} />
                    ) : (
                        <Typography variant="body1">No content available for this email.</Typography>
                    )}
                </EmailBodyContainer>
            </ContentContainer>
        </Wrapper>
    );
};

// Helper function to format sender name
const getSenderName = (sender) => {
    if (!sender) return 'Unknown Sender';
    
    // Pattern for "Name <email@example.com>"
    const nameEmailPattern = /^([^<]+)<([^>]+)>$/;
    const match = sender.match(nameEmailPattern);
    
    if (match) {
        // Return just the name part, trimmed
        return match[1].trim();
    }
    
    // If not in the expected format, check if it's just an email
    if (sender.includes('@')) {
        // Try to make a name from the email username
        const username = sender.split('@')[0];
        
        // Format username: convert 'john.doe' or 'john_doe' to 'John Doe'
        return username
            .replace(/[._-]/g, ' ')  // Replace dots, underscores, hyphens with spaces
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    
    // If nothing matches, return the original
    return sender;
};

// Helper function to get badge color based on category
const getBadgeColor = (category) => {
    switch(category.toLowerCase()) {
        case 'subscriptions':
            return '#1976d2'; // Blue
        case 'updates':
            return '#2196f3'; // Light Blue
        case 'essential':
            return '#f44336'; // Red
        case 'social':
            return '#9c27b0'; // Purple
        case 'promotions':
            return '#4caf50'; // Green
        default:
            return '#757575'; // Grey
    }
};

export default ViewEmails;

/* ============ Styled Components ============ */
const Wrapper = styled(Box)(({ theme }) => ({
    height: 'calc(100vh - 70px)', // Adjust based on your header height
    padding: '0',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: '1200px',
    margin: '0 auto', // Center the content
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    backgroundColor: '#ffffff',
}));

const LeftToolbar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
}));

const RightToolbar = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
}));

const ContentContainer = styled(Box)(({ theme }) => ({
    padding: '0 40px 40px 40px',
    overflow: 'auto',
    flexGrow: 1,
    maxWidth: '900px',
    margin: '0 auto', // Center the content
    width: '100%',
}));

const SubjectWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    paddingTop: '10px',
    flexWrap: 'wrap',
}));

const SubjectText = styled(Typography)(({ theme }) => ({
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    wordBreak: 'break-word',
    marginRight: 'auto',
}));

const CategoryBadge = styled(Box)(({ category }) => ({
    fontSize: '13px',
    background: getBadgeColor(category),
    color: '#fff',
    borderRadius: '4px',
    padding: '4px 10px',
    fontWeight: 'bold',
    display: 'inline-block',
    minWidth: '80px',
    textAlign: 'center',
    height: 'fit-content',
}));

const SenderInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '18px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
}));

const ProfileImage = styled('img')(({ theme }) => ({
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    marginRight: '15px',
    backgroundColor: '#e0e0e0',
    border: '2px solid #d0d0d0',
    objectFit: 'cover',
}));

const SenderDetails = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
}));

const SenderNameRow = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
}));

const SenderName = styled(Typography)(({ theme }) => ({
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px',
}));

const EmailBodyContainer = styled(Paper)(({ theme }) => ({
    padding: '30px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    minHeight: '300px',
    maxHeight: 'calc(100vh - 300px)',
    overflow: 'auto',
    border: '1px solid #e0e0e0',
}));

const LoadingText = styled(Typography)(({ theme }) => ({
    padding: '20px',
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
}));

const EmptyStateWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'calc(100vh - 100px)',
    padding: '20px',
    textAlign: 'center',
}));

const Button = styled('button')(({ theme }) => ({
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.2s',
    '&:hover': {
        backgroundColor: '#0069d9',
    },
}));