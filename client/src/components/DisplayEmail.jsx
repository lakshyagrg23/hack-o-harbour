import React, { useContext } from 'react';
import { ListItem, Checkbox, Typography, Box, styled } from "@mui/material";
import { StarBorder, Star } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { routes } from '../routes/route';
import useApi from '../hooks/useApi';
import { API_URLS } from '../api/api.url';
import { emailContext } from '../App';

const DisplayEmail = ({ email, allow }) => {
    const toggleService = useApi(API_URLS.starredEmail);
    const navigate = useNavigate();
    const emo = useContext(emailContext);

    // Function to toggle the starred state
    const toggleStarred = async () => {
        try {
            await toggleService.call({ id: email._id, value: !email.starred });
            emo.setSelectedEmails((prevEmails) =>
                prevEmails.map((e) =>
                    e._id === email._id ? { ...e, starred: !e.starred } : e
                )
            );
        } catch (error) {
            console.error("Error updating starred state:", error);
        }
    };

    // Handle checkbox selection
    const onSelectChange = (email) => {
        emo.setSelectedEmails((prevSelected) => {
            const selectedSet = new Set(prevSelected); // Use Set to avoid duplicates
            
            console.log(selectedSet)

            if (selectedSet.has(email._id)) {
                selectedSet.delete(email._id);  // Remove if already selected
            } else {
                selectedSet.add(email._id);  // Add if not selected
            }
            
            return Array.from(selectedSet); // Convert back to array
        });
        setTimeout(1000,console.log(emo.selectedEmails))
    };

    const reduceEmailBody = (body, maxLength) => 
        body.length <= maxLength ? body : body.slice(0, maxLength) + "...";

    // Function to format email body with clickable links
    const formatEmailBody = (body) => {
        return body.replace(/(https?:\/\/[^\s]+)/g, (url) => {
            return `<a href="${url}" target="_blank" style="color: #007bff; text-decoration: none;">${url}</a>`;
        });
    };

    const truncatedBody = email.body ? formatEmailBody(reduceEmailBody(email.body, 50)) : '';

    // // Styled Components
    // const Wrapper = styled(Box)({
    //     padding: '12px 16px',
    //     background: '#ffffff',
    //     display: 'flex',
    //     alignItems: 'center',
    //     cursor: 'pointer',
    //     borderBottom: '1px solid #e0e0e0',
    //     transition: 'background 0.2s ease-in-out',
    //     '&:hover': {
    //         background: '#f5f5f5',
    //     },
    // });

    // const Indicator = styled(Typography)({
    //     fontSize: '12px',
    //     background: '#007bff',
    //     color: '#fff',
    //     borderRadius: '4px',
    //     padding: '2px 6px',
    //     fontWeight: 'bold',
    //     display: 'inline-block',
    //     minWidth: '80px',
    //     textAlign: 'center'
    // });

    // return (
    //     <Wrapper
    //         onClick={(e) => {
    //             if (e.target.type !== 'checkbox' && e.target.tagName !== 'svg') {
    //                 navigate(routes.view.path, { state: { email } });
    //             }
    //         }}
    //     >
    //         <text>--</text>
    //         {/* Checkbox */}
    //         {allow && (
    //             <Checkbox
    //                 size="small"
    //                 checked={emo.selectedEmails.includes(email._id)}
    //                 onChange={(e) => { 
    //                     e.stopPropagation(); 
    //                     e.preventDefault();
    //                     onSelectChange(email); 
    //                 }} 
    //             />
    //         )}

    //         {/* Star Icon */}
    //         {/* {email.starred ? (
    //             <Star fontSize="small" sx={{ marginRight: 2, color: '#F4B400', cursor: 'pointer' }} 
    //                 onClick={(e) => { e.stopPropagation(); toggleStarred(); }} 
    //             />
    //         ) : (
    //             <StarBorder fontSize="small" sx={{ marginRight: 2, cursor: 'pointer' }} 
    //                 onClick={(e) => { e.stopPropagation(); toggleStarred(); }} 
    //             />
    //         )} */}

    //         <Box display="flex" alignItems="center" flex="1" overflow="hidden" padding={1}>
    //             {/* Sender */}
    //             <Typography sx={{ fontWeight: 'bold', minWidth: '200px', maxWidth: '180px', color: '#333' }}>
    //                 {email.sender.includes('<') ? email.sender.split('<')[0].trim() : email.sender}
    //             </Typography>


    //             {/* Category Badge */}
    //             <Indicator sx={{ marginLeft: 2 }}>
    //                 {email.category}
    //             </Indicator>

    //             {/* Subject & Body */}
    //             <Typography 
    //                 sx={{ marginLeft: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1, color: '#444' }}
    //                 dangerouslySetInnerHTML={{ __html: `<strong>${email.subject}</strong> - ${truncatedBody}` }}
    //             />
    //         </Box>
    //     </Wrapper>
    // );
    const Wrapper = styled(Box)({
        padding: '14px 18px',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        borderBottom: '1px solid #e0e0e0',
        transition: 'background 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
            background: '#f9f9f9',
            boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
        },
    });
    
    const Indicator = styled(Typography)({
        fontSize: '12px',
        background: '#007bff',
        color: '#fff',
        borderRadius: '4px',
        padding: '4px 8px',
        fontWeight: 'bold',
        display: 'inline-block',
        minWidth: '80px',
        textAlign: 'center',
    });
    
    const Sender = styled(Typography)({
        fontWeight: 'bold',
        color: '#333',
        minWidth: '180px',
        maxWidth: '200px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    });
    
    const SubjectBody = styled(Typography)({
        marginLeft: '10px',
        color: '#444',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexGrow: 1,
    });
    
    return (
        <Wrapper
            onClick={(e) => {
                if (e.target.type !== 'checkbox' && e.target.tagName !== 'svg') {
                    navigate(routes.view.path, { state: { email } });
                }
            }}
        >
            {/* Checkbox */}
            {allow && (
                <Checkbox
                    size="small"
                    checked={emo.selectedEmails.includes(email._id)}
                    onChange={(e) => { 
                        e.stopPropagation(); 
                        e.preventDefault();
                        onSelectChange(email); 
                    }} 
                />
            )}
    
            {/* Star Icon */}
            {email.starred ? (
                <Star fontSize="small" sx={{ marginRight: 2, color: '#F4B400', cursor: 'pointer' }} 
                    onClick={(e) => { e.stopPropagation(); toggleStarred(); }} 
                />
            ) : (
                <StarBorder fontSize="small" sx={{ marginRight: 2, cursor: 'pointer' }} 
                    onClick={(e) => { e.stopPropagation(); toggleStarred(); }} 
                />
            )}
    
            <Box display="flex" alignItems="center" flex="1" overflow="hidden">
                {/* Sender */}
                <Sender>
                    {email.sender.includes('<') ? email.sender.split('<')[0].trim() : email.sender}
                </Sender>
    
                {/* Category Badge */}
                <Indicator sx={{ marginLeft: 12 }}>
                    {email.category}
                </Indicator>
    
                {/* Subject & Body */}
                <SubjectBody dangerouslySetInnerHTML={{ __html: `<strong>${email.subject}</strong> - ${truncatedBody}` }} />
            </Box>
        </Wrapper>
    );
    
};

export default DisplayEmail;
