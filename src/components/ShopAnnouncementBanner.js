import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../endpoints/endpoints";
import { Sparkles } from "lucide-react";

const ShopAnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/announcement/active?target=shop`);
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

  if (loading || !announcement) return null;

  const AnnouncementContent = () => (
    <span className="flex items-center space-x-2 px-8">
      <Sparkles className="w-4 h-4 flex-shrink-0" />
      <span>{`${announcement.title}: ${announcement.message}`}</span>
    </span>
  );

  return (
    <div className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 overflow-hidden z-20">
      <div className="flex items-center h-full">
        <div className="flex items-center whitespace-nowrap text-white font-semibold text-sm animate-scroll-x">
          <AnnouncementContent />
          <AnnouncementContent />
        </div>
      </div>
    </div>
  );
};

export default ShopAnnouncementBanner;
