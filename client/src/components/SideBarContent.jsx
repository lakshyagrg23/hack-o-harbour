import {
    Box,
    List,
    ListItem,
    Dialog,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { CreateOutlined } from "@mui/icons-material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useState, useContext, useEffect } from "react";
import { SIDEBAR_DATA } from "../content/SideBar.content";
import NewCategory from "./NewCategory";
import Compose from "./Compose";
import { useParams, NavLink } from "react-router-dom";
import { routes } from "../routes/route";
import { emailContext } from "../App";
import { motion } from "framer-motion";
import axios from "axios";


const isLightColor = (hex) => {
    // Convert hex to RGB
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);

    // Calculate brightness using the relative luminance formula
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

    // Consider a color light if brightness > 200 (adjustable threshold)
    return brightness > 200;
};

const getRandomColor = () => {
    let color;
    do {
        color = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
    } while (isLightColor(color));
    return color;
};

const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
    return urlParams.get(param);
};

const SideBarContent = () => {
const categoryHook = useContext(emailContext);
const [openDialog, setOpenDialog] = useState(false);
const [openPopup, setOpenPopup] = useState(false);
const { type } = useParams();

const onComposeClick = () => setOpenDialog(true);
const handlePopupOpen = () => setOpenPopup(true);
const handlePopupClose = () => setOpenPopup(false);

const userId = getQueryParam("user_id"); // Extract user ID from URL
console.log(userId);

useEffect(() => {
    const fetchCategories = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/categories/${userId}`);
            console.log(response)
            categoryHook.setCategories([{ name: "All", title: "All Emails" }, ...response.data]);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    if (userId) fetchCategories(); // Fetch only if userId is available
}, [userId]);

return (
    <motion.div
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="p-4 rounded-xl shadow-lg bg-gradient-to-b from-gray-50 via-white to-gray-100 flex flex-col"
    >
    {/* ✨ Compose Button */}
    <motion.button
        onClick={onComposeClick}
        className="bg-blue-500 text-white !rounded-xl px-6 py-3 !text-xl font-semibold flex items-center gap-3 transition-all duration-500 hover:shadow-lg hover:scale-105 active:scale-95"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <CreateOutlined className="text-xl" />
        Compose
    </motion.button>

    {/* 📌 Categories List */}
    <List className="mt-6 space-y-0">
    {/* console.log("categoryHook:", categoryHook);
console.log("categories:", categoryHook?.categories); */}

    {categoryHook.categories?.map((data, index) => (
        <NavLink
            key={data.name}
            to={`${routes.email.path}/${data.name}`}
            onClick={() => categoryHook.setCategory(data.name)}
            className="block !no-underline"
        >
            <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            >
            <ListItem
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-500 ${
                type === data.name.toLowerCase()
                    ? "shadow-md scale-[1.05] bg-gray-900 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
                <div className="flex items-center gap-3 mr-4">
                {/* 🟢 Colored Dots */}
                <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getRandomColor() }}
                ></span>
                <span className="text-base no-underline font-medium text-gray-700 group-hover:text-gray-900">
                    {data.name}
                </span>
                </div>
                <span className="text-base font-semibold text-gray-500">
                {/* {getCategoryCount(data.name)} */}
                </span>
            </ListItem>
            </motion.div>
        </NavLink>
        ))}
    </List>

    {/* 📂 Add Category Button */}
    <motion.button
        onClick={handlePopupOpen}
        className="mt-auto bg-gradient-to-r from-gray-700 to-gray-900 text-white !rounded-xl px-6 py-3 text-lg flex items-center gap-3 transition-all duration-500 hover:scale-105 hover:shadow-lg"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
    >
        <AddCircleIcon fontSize="small" />
        Add Category
    </motion.button>

    {/* 🎨 Category Customization Popup */}
    <Dialog open={openPopup} onClose={handlePopupClose}>
        <DialogContent>
        <NewCategory />
        </DialogContent>
        <DialogActions>
        <Button onClick={handlePopupClose} color="primary">
            Close
        </Button>
        </DialogActions>
    </Dialog>

    {/* 📬 Compose Email Popup */}
    <Compose openDialog={openDialog} setOpenDialog={setOpenDialog} />
    </motion.div>
);
};

export default SideBarContent;
  