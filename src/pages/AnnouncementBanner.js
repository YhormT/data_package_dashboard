import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/announcement/active`);
        // Backend returns { success, data: [...] }
        if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setAnnouncement(res.data.data[0]);
        } else {
          setAnnouncement(null);
        }
      } catch (err) {
        setAnnouncement(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncement();
  }, []);

  if (loading) return null;

  return (
    <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 overflow-hidden z-20">
      <div className="flex items-center h-full">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex items-center whitespace-nowrap text-white font-semibold text-sm"
        >
          <div className="flex items-center space-x-8 px-8">
            <span className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>
                {announcement ? announcement.title + ": " + announcement.message : "No announcement at this time."}
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
