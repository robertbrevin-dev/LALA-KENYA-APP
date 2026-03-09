import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { supabase } from '../../lib/supabase';

const NAIROBI = { lat: -1.286389, lng: 36.817223 };

const LANDMARKS = [
  { name: 'Kenyatta International Conference Centre', short: 'KICC', lat: -1.2864, lng: 36.8182, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Nairobi National Museum', short: 'National Museum', lat: -1.2732, lng: 36.8128, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Nairobi National Park', short: 'National Park', lat: -1.3600, lng: 36.8600, icon: '🦁', cat: 'nature', color: '#3ECFB2' },
  { name: 'David Sheldrick Wildlife Trust', short: 'Elephant Orphanage', lat: -1.3619, lng: 36.7731, icon: '🐘', cat: 'nature', color: '#3ECFB2' },
  { name: 'Giraffe Centre', short: 'Giraffe Centre', lat: -1.3742, lng: 36.7542, icon: '🦒', cat: 'nature', color: '#3ECFB2' },
  { name: 'Karura Forest', short: 'Karura Forest', lat: -1.2315, lng: 36.8220, icon: '🌲', cat: 'nature', color: '#3ECFB2' },
  { name: 'Nairobi Arboretum', short: 'Arboretum', lat: -1.2770, lng: 36.8108, icon: '🌳', cat: 'nature', color: '#3ECFB2' },
  { name: 'Uhuru Gardens Nairobi', short: 'Uhuru Gardens', lat: -1.3081, lng: 36.8219, icon: '🌿', cat: 'landmark', color: '#E8B86D' },
  { name: 'Parliament Buildings Kenya', short: 'Parliament', lat: -1.2867, lng: 36.8193, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Fort Jesus Mombasa', short: 'Fort Jesus', lat: -4.0617, lng: 39.6814, icon: '🏰', cat: 'landmark', color: '#E8B86D' },
  { name: 'Lake Nakuru National Park', short: 'Lake Nakuru Park', lat: -0.3600, lng: 36.0900, icon: '🦩', cat: 'nature', color: '#3ECFB2' },
  { name: 'Lake Victoria Kisumu', short: 'Lake Victoria', lat: -0.1100, lng: 34.7500, icon: '🌊', cat: 'nature', color: '#3ECFB2' },
  { name: 'Maasai Mara National Reserve', short: 'Maasai Mara', lat: -1.4800, lng: 35.1400, icon: '🦁', cat: 'nature', color: '#3ECFB2' },
  { name: 'Mount Kenya National Park', short: 'Mount Kenya', lat: -0.1521, lng: 37.3084, icon: '🏔️', cat: 'nature', color: '#3ECFB2' },
  { name: 'Diani Beach Kwale', short: 'Diani Beach', lat: -4.3167, lng: 39.5667, icon: '🏖️', cat: 'nature', color: '#3ECFB2' },
  { name: 'Bamburi Beach Mombasa', short: 'Bamburi Beach', lat: -3.9900, lng: 39.7200, icon: '🏖️', cat: 'nature', color: '#3ECFB2' },
  { name: 'Jomo Kenyatta International Airport', short: 'JKIA Airport', lat: -1.3192, lng: 36.9275, icon: '✈️', cat: 'transport', color: '#A29BFE' },
  { name: 'Wilson Airport Nairobi', short: 'Wilson Airport', lat: -1.3213, lng: 36.8148, icon: '🛩️', cat: 'transport', color: '#A29BFE' },
  { name: 'Moi International Airport Mombasa', short: 'Mombasa Airport', lat: -4.0348, lng: 39.5942, icon: '✈️', cat: 'transport', color: '#A29BFE' },
  { name: 'Kisumu International Airport', short: 'Kisumu Airport', lat: -0.0861, lng: 34.7289, icon: '✈️', cat: 'transport', color: '#A29BFE' },
  { name: 'Eldoret International Airport', short: 'Eldoret Airport', lat: 0.4045, lng: 35.2389, icon: '✈️', cat: 'transport', color: '#A29BFE' },
  { name: 'Nairobi SGR Station Syokimau', short: 'SGR Syokimau', lat: -1.3500, lng: 36.9050, icon: '🚆', cat: 'transport', color: '#A29BFE' },
  { name: 'Nairobi Railway Station', short: 'Railway Station', lat: -1.2941, lng: 36.8284, icon: '🚉', cat: 'transport', color: '#A29BFE' },
  { name: 'Westlands Bus Terminal', short: 'Westlands Bus', lat: -1.2630, lng: 36.8050, icon: '🚌', cat: 'transport', color: '#A29BFE' },
  { name: 'Machakos Country Bus Station', short: 'Country Bus', lat: -1.2991, lng: 36.8370, icon: '🚌', cat: 'transport', color: '#A29BFE' },
  { name: 'Mombasa SGR Station', short: 'Mombasa SGR', lat: -4.0348, lng: 39.5900, icon: '🚆', cat: 'transport', color: '#A29BFE' },
  { name: 'Westgate Shopping Mall', short: 'Westgate Mall', lat: -1.2577, lng: 36.8058, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Junction Mall Nairobi', short: 'Junction Mall', lat: -1.3002, lng: 36.7757, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Village Market Nairobi', short: 'Village Market', lat: -1.2228, lng: 36.8059, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Garden City Mall Nairobi', short: 'Garden City', lat: -1.2281, lng: 36.8918, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Two Rivers Mall Nairobi', short: 'Two Rivers Mall', lat: -1.2071, lng: 36.7920, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'The Hub Karen Nairobi', short: 'The Hub Karen', lat: -1.3241, lng: 36.7152, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Sarit Centre Westlands', short: 'Sarit Centre', lat: -1.2658, lng: 36.8035, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'City Mall Mombasa', short: 'City Mall Mombasa', lat: -4.0500, lng: 39.6630, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Nyali Centre Mombasa', short: 'Nyali Centre', lat: -4.0200, lng: 39.7100, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Mega City Mall Kisumu', short: 'Mega City Kisumu', lat: -0.0917, lng: 34.7677, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Aga Khan University Hospital Nairobi', short: 'Aga Khan NBI', lat: -1.2607, lng: 36.8225, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Nairobi Hospital', short: 'Nairobi Hospital', lat: -1.2995, lng: 36.7903, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Kenyatta National Hospital', short: 'KNH', lat: -1.3003, lng: 36.8067, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Karen Hospital Nairobi', short: 'Karen Hospital', lat: -1.3200, lng: 36.7120, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Mater Hospital Nairobi', short: 'Mater Hospital', lat: -1.3033, lng: 36.8500, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Aga Khan Hospital Mombasa', short: 'Aga Khan MBA', lat: -4.0500, lng: 39.6600, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Coast General Hospital Mombasa', short: 'Coast General', lat: -4.0614, lng: 39.6644, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Kisumu County Referral Hospital', short: 'Kisumu Referral', lat: -0.1022, lng: 34.7617, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Nakuru Level 5 Hospital', short: 'Nakuru Hospital', lat: -0.2950, lng: 36.0660, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'MTRH Eldoret', short: 'MTRH Eldoret', lat: 0.5167, lng: 35.2667, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'University of Nairobi', short: 'UoN Campus', lat: -1.2793, lng: 36.8175, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Kenyatta University Nairobi', short: 'Kenyatta Uni', lat: -1.1808, lng: 36.9266, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Strathmore University Nairobi', short: 'Strathmore', lat: -1.3083, lng: 36.8126, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'USIU Africa Nairobi', short: 'USIU', lat: -1.2218, lng: 36.9050, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Moi University Eldoret', short: 'Moi University', lat: 0.5167, lng: 35.2667, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Maseno University Kisumu', short: 'Maseno Uni', lat: 0.0050, lng: 34.6017, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Technical University of Mombasa', short: 'TU Mombasa', lat: -4.0622, lng: 39.6680, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Kilimani Nairobi', short: 'Kilimani', lat: -1.2921, lng: 36.7821, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Karen Nairobi', short: 'Karen', lat: -1.3186, lng: 36.7126, icon: '🏡', cat: 'area', color: '#FD79A8' },
  { name: 'Lavington Nairobi', short: 'Lavington', lat: -1.2795, lng: 36.7689, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Westlands Nairobi', short: 'Westlands', lat: -1.2650, lng: 36.8032, icon: '🏢', cat: 'area', color: '#FD79A8' },
  { name: 'Upperhill Nairobi', short: 'Upperhill', lat: -1.2991, lng: 36.8181, icon: '🏢', cat: 'area', color: '#FD79A8' },
  { name: 'Eastleigh Nairobi', short: 'Eastleigh', lat: -1.2700, lng: 36.8550, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Parklands Nairobi', short: 'Parklands', lat: -1.2589, lng: 36.8189, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Nyali Mombasa', short: 'Nyali', lat: -4.0200, lng: 39.7100, icon: '🏖️', cat: 'area', color: '#FD79A8' },
  { name: 'Old Town Mombasa', short: 'Mombasa Old Town', lat: -4.0614, lng: 39.6680, icon: '🕌', cat: 'area', color: '#FD79A8' },
  { name: 'Kisumu CBD', short: 'Kisumu CBD', lat: -0.0917, lng: 34.7680, icon: '🏙️', cat: 'area', color: '#FD79A8' },
  { name: 'Nakuru CBD', short: 'Nakuru CBD', lat: -0.3031, lng: 36.0800, icon: '🏙️', cat: 'area', color: '#FD79A8' },
  { name: 'Eldoret CBD', short: 'Eldoret CBD', lat: 0.5200, lng: 35.2698, icon: '🏙️', cat: 'area', color: '#FD79A8' },
  { name: 'KFC Westlands Nairobi', short: 'KFC Westlands', lat: -1.2660, lng: 36.8040, icon: '🍗', cat: 'stays', color: '#E17055' },
  { name: 'KFC Junction Mall', short: 'KFC Junction', lat: -1.3005, lng: 36.7760, icon: '🍗', cat: 'stays', color: '#E17055' },
  { name: "McDonald's Westgate", short: "McDonald's", lat: -1.2576, lng: 36.8060, icon: '🍔', cat: 'stays', color: '#E17055' },
  { name: 'Burger King Two Rivers', short: 'Burger King', lat: -1.2073, lng: 36.7921, icon: '🍔', cat: 'stays', color: '#E17055' },
  { name: 'Chicken Inn CBD', short: 'Chicken Inn CBD', lat: -1.2845, lng: 36.8205, icon: '🍗', cat: 'stays', color: '#E17055' },
  { name: 'KFC Mombasa', short: 'KFC Mombasa', lat: -4.0500, lng: 39.6630, icon: '🍗', cat: 'stays', color: '#E17055' },
  { name: 'Java House Westlands', short: 'Java Westlands', lat: -1.2646, lng: 36.8042, icon: '☕', cat: 'education', color: '#FDCB6E' },
  { name: 'Java House Junction', short: 'Java Junction', lat: -1.3002, lng: 36.7757, icon: '☕', cat: 'education', color: '#FDCB6E' },
  { name: 'Java House CBD', short: 'Java CBD', lat: -1.2855, lng: 36.8195, icon: '☕', cat: 'education', color: '#FDCB6E' },
  { name: 'Artcaffe Westgate', short: 'Artcaffe', lat: -1.2579, lng: 36.8056, icon: '☕', cat: 'education', color: '#FDCB6E' },
  { name: 'Dormans Coffee Westlands', short: 'Dormans', lat: -1.2648, lng: 36.8040, icon: '☕', cat: 'education', color: '#FDCB6E' },
  { name: 'Carnivore Restaurant Nairobi', short: 'Carnivore', lat: -1.3225, lng: 36.8042, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'The Talisman Karen', short: 'Talisman', lat: -1.3188, lng: 36.7158, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Tamarind Nairobi', short: 'Tamarind NBI', lat: -1.2869, lng: 36.8178, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Tamarind Mombasa', short: 'Tamarind MBA', lat: -4.0614, lng: 39.6644, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Habesha Ethiopian Restaurant', short: 'Habesha', lat: -1.2660, lng: 36.8038, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'B Club Westlands Nairobi', short: 'B Club NBI', lat: -1.2644, lng: 36.8046, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'K1 Klubhouse Westlands', short: 'K1 Klubhouse', lat: -1.2635, lng: 36.8042, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Brew Bistro Westlands', short: 'Brew Bistro', lat: -1.2648, lng: 36.8044, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Signature Nairobi', short: 'Club Signature', lat: -1.2655, lng: 36.8050, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'The Alchemist Westlands', short: 'The Alchemist', lat: -1.2630, lng: 36.8055, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Tribeka Nairobi', short: 'Tribeka NBI', lat: -1.2660, lng: 36.8038, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Space Lounge Nairobi', short: 'Space Lounge', lat: -1.2658, lng: 36.8032, icon: '🍸', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Havana Bar Nairobi', short: 'Havana NBI', lat: -1.2850, lng: 36.8210, icon: '🍹', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Gipsy Bar Karen', short: 'Gipsy Bar', lat: -1.3215, lng: 36.7118, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Privee Westlands', short: 'Club Privee', lat: -1.2650, lng: 36.8042, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Mist Club Westlands', short: 'Mist Club', lat: -1.2648, lng: 36.8055, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Forty Thieves Beach Bar Mombasa', short: 'Forty Thieves', lat: -4.0300, lng: 39.7150, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Billionaires Mombasa', short: 'Club Billionaires', lat: -4.0500, lng: 39.6640, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Casablanca Mombasa', short: 'Casablanca', lat: -4.0550, lng: 39.6620, icon: '🍹', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Havana Mombasa', short: 'Havana MBA', lat: -4.0220, lng: 39.7130, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Tembo Disco Mombasa', short: 'Tembo Disco', lat: -4.0614, lng: 39.6680, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Octopus Club Kisumu', short: 'Octopus Kisumu', lat: -0.0930, lng: 34.7690, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Havana Kisumu', short: 'Havana Kisumu', lat: -0.0915, lng: 34.7670, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Shimmers Beach Bar Kisumu', short: 'Shimmers', lat: -0.0850, lng: 34.7600, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club X Nakuru', short: 'Club X Nakuru', lat: -0.3031, lng: 36.0830, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Havana Club Nakuru', short: 'Havana Nakuru', lat: -0.3010, lng: 36.0810, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Legends Eldoret', short: 'Club Legends', lat: 0.5210, lng: 35.2700, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Sky Lounge Eldoret', short: 'Sky Lounge', lat: 0.5200, lng: 35.2680, icon: '🍸', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Nairobi Serena Hotel', short: 'Serena Hotel', lat: -1.2876, lng: 36.8121, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Villa Rosa Kempinski', short: 'Kempinski', lat: -1.2912, lng: 36.7818, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Tribe Hotel Village Market', short: 'Tribe Hotel', lat: -1.2230, lng: 36.8055, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Intercontinental Nairobi', short: 'Intercontinental', lat: -1.2868, lng: 36.8176, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Radisson Blu Upperhill', short: 'Radisson Blu', lat: -1.2989, lng: 36.8172, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Sarova Whitesands Mombasa', short: 'Whitesands', lat: -3.9800, lng: 39.7200, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Voyager Beach Resort Mombasa', short: 'Voyager Resort', lat: -3.9900, lng: 39.7150, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Sovereign Hotel Kisumu', short: 'Sovereign', lat: -0.0917, lng: 34.7700, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Carrefour Two Rivers', short: 'Carrefour', lat: -1.2073, lng: 36.7922, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Quickmart Westlands', short: 'Quickmart', lat: -1.2658, lng: 36.8035, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Naivas Karen Nairobi', short: 'Naivas Karen', lat: -1.3238, lng: 36.7154, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Naivas Mombasa', short: 'Naivas MBA', lat: -4.0500, lng: 39.6640, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Naivas Kisumu', short: 'Naivas Kisumu', lat: -0.0917, lng: 34.7680, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Shell Westlands', short: 'Shell Westlands', lat: -1.2668, lng: 36.8028, icon: '⛽', cat: 'nature', color: '#FDCB6E' },
  { name: 'Total Energies Kilimani', short: 'Total Kilimani', lat: -1.2916, lng: 36.7823, icon: '⛽', cat: 'nature', color: '#FDCB6E' },
  { name: 'Kenol CBD Nairobi', short: 'Kenol CBD', lat: -1.2850, lng: 36.8240, icon: '⛽', cat: 'nature', color: '#FDCB6E' },
  { name: 'Nairobi Central Police Station', short: 'Central Police', lat: -1.2875, lng: 36.8232, icon: '🚓', cat: 'area', color: '#74B9FF' },
  { name: 'Kilimani Police Station', short: 'Kilimani Police', lat: -1.2940, lng: 36.7830, icon: '🚓', cat: 'area', color: '#74B9FF' },
  { name: 'Mombasa Central Police', short: 'Mombasa Police', lat: -4.0614, lng: 39.6644, icon: '🚓', cat: 'area', color: '#74B9FF' },
  { name: 'Kisumu Central Police', short: 'Kisumu Police', lat: -0.0917, lng: 34.7680, icon: '🚓', cat: 'area', color: '#74B9FF' },
  { name: 'Jamia Mosque Nairobi CBD', short: 'Jamia Mosque', lat: -1.2830, lng: 36.8209, icon: '🕌', cat: 'cultural', color: '#A29BFE' },
  { name: 'All Saints Cathedral Nairobi', short: 'All Saints', lat: -1.2864, lng: 36.8222, icon: '⛪', cat: 'cultural', color: '#A29BFE' },
];

const AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'kilimani': { lat: -1.2921, lng: 36.7821 },
  'westlands': { lat: -1.2686, lng: 36.8032 },
  'ngong': { lat: -1.3089, lng: 36.7804 },
  'rongai': { lat: -1.3988, lng: 36.7456 },
  'kasarani': { lat: -1.2241, lng: 36.8969 },
  'lavington': { lat: -1.2795, lng: 36.7689 },
  'karen': { lat: -1.3186, lng: 36.7126 },
  'parklands': { lat: -1.2589, lng: 36.8189 },
  'upperhill': { lat: -1.2991, lng: 36.8181 },
  'hurlingham': { lat: -1.2991, lng: 36.7821 },
  'runda': { lat: -1.2241, lng: 36.7821 },
  'muthaiga': { lat: -1.2532, lng: 36.8414 },
  'langata': { lat: -1.3488, lng: 36.7456 },
  'ruiru': { lat: -1.1489, lng: 36.9606 },
  'thika': { lat: -1.0332, lng: 37.0693 },
  'south b': { lat: -1.3180, lng: 36.8320 },
  'south c': { lat: -1.3260, lng: 36.8200 },
  'eastleigh': { lat: -1.2700, lng: 36.8550 },
};

const TRAVEL = {
  walk:      { icon: '🚶', label: 'Walk',    speed: 5,  color: '#3ECFB2', osrm: 'foot' },
  bicycle:   { icon: '🚴', label: 'Bicycle', speed: 15, color: '#E8B86D', osrm: 'cycling' },
  motorbike: { icon: '🏍️', label: 'Boda',   speed: 40, color: '#FF9F43', osrm: 'driving' },
  car:       { icon: '🚗', label: 'Drive',   speed: 60, color: '#A29BFE', osrm: 'driving' },
};

type TMode = keyof typeof TRAVEL;

const LANDMARK_CATS = [
  { id: 'all',         label: '🌍 All',          color: '#E8B86D' },
  { id: 'landmark',   label: '🏛️ Landmarks',    color: '#E8B86D' },
  { id: 'transport',  label: '✈️ Transport',     color: '#A29BFE' },
  { id: 'mall',       label: '🛍️ Malls',        color: '#FF9F43' },
  { id: 'fastfood',   label: '🍗 Fast Food',     color: '#E17055' },
  { id: 'cafe',       label: '☕ Cafes',          color: '#FDCB6E' },
  { id: 'restaurant', label: '🍽️ Restaurants',  color: '#FDCB6E' },
  { id: 'nightlife',  label: '🎵 Nightlife',     color: '#A29BFE' },
  { id: 'supermarket',label: '🛒 Supermarkets',  color: '#00B894' },
  { id: 'hospital',   label: '🏥 Hospitals',     color: '#FF6B6B' },
  { id: 'hotel',      label: '🏨 Hotels',        color: '#FD79A8' },
  { id: 'safety',     label: '🚓 Police',        color: '#74B9FF' },
  { id: 'petrol',     label: '⛽ Petrol',        color: '#FDCB6E' },
  { id: 'nature',     label: '🌿 Nature',        color: '#3ECFB2' },
  { id: 'education',  label: '🎓 Uni',           color: '#74B9FF' },
  { id: 'area',       label: '🏘️ Areas',         color: '#FD79A8' },
];



function resolveCoords(location: string, index: number) {
  const loc = location?.toLowerCase() || '';
  for (const [key, val] of Object.entries(AREA_COORDS)) {
    if (loc.includes(key)) {
      return { lat: val.lat + (index % 3 - 1) * 0.004, lng: val.lng + (index % 2 - 0.5) * 0.006 };
    }
  }
  const key = Object.keys(AREA_COORDS).find(k => location.toLowerCase().includes(k));
  if (key) {
    const base = AREA_COORDS[key];
    return { lat: base.lat + (index % 5 - 2) * 0.002, lng: base.lng + (index % 3 - 1) * 0.002 };
  }
  return { lat: NAIROBI.lat + (index % 7 - 3) * 0.01, lng: NAIROBI.lng + (index % 5 - 2) * 0.01 };
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function fmtDist(km: number) { return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`; }

function fmtEta(km: number, speed: number) {
  const m = Math.round((km / speed) * 60);
  if (m < 1) return '< 1 min';
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default function MapPage() {
  const navigate = useNavigate();
  const { properties, currentUser, loading } = useApp();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const propMarkersRef = useRef<any[]>([]);
  const landmarkMarkersRef = useRef<any[]>([]);
  const routeRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const guestShareRef = useRef<number | null>(null);
  const guestMarkersRef = useRef<Map<string, any>>(new Map());

  const [loaded, setLoaded] = useState(false);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [selectedLandmark, setSelectedLandmark] = useState<any>(null);
  const [mode, setMode] = useState<TMode>('car');
  const [navigating, setNavigating] = useState(false);
  const [gpsError, setGpsError] = useState(false);
  const [search, setSearch] = useState('');
  const [propFilter, setPropFilter] = useState('All');
  const [landmarkCat, setLandmarkCat] = useState('all');
  const panel = 'guest';
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [nearbyAlert, setNearbyAlert] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distKm: number; durationMin: number; steps: string[] } | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [liveGuests, setLiveGuests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ name: string; lat: number; lng: number; type: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('lala-map-recents') || '[]'); } catch { return []; }
  });
  const [searchPin, setSearchPin] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchPinMarkerRef = useRef<any>(null);
  
  // Set panel based on user role
  useEffect(() => {
    console.log('🗺️ Map - User role check:', { currentUser, role: currentUser?.role });
    // role handled by BottomNav navType prop
  }, [currentUser]);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lala-map-theme') === 'dark' ||
        document.documentElement.classList.contains('dark');
    }
    return true;
  });

  const propList = properties.map((p, i) => ({ ...p, coords: (p.latitude && p.longitude) ? { lat: p.latitude, lng: p.longitude } : resolveCoords(p.location, i) }));
  const filteredProps = propList.filter(p => {
    const ms = p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase());
    const mf = propFilter === 'All' || p.category === propFilter;
    return ms && mf;
  });
  const filteredLandmarks = LANDMARKS.filter(l => landmarkCat === 'all' || l.cat === landmarkCat);
  const targetCoords = selected?.coords || (selectedLandmark ? { lat: selectedLandmark.lat, lng: selectedLandmark.lng } : null);
  const dist = userPos && targetCoords ? haversineKm(userPos, targetCoords) : null;
  const eta = dist ? fmtEta(dist, TRAVEL[mode].speed) : null;

  useEffect(() => {
    if (!mapInstance.current || !loaded) return;
    if (!L) return;
    if (tileLayerRef.current) {
      try { mapInstance.current.removeLayer(tileLayerRef.current); } catch {}
    }
    const url = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    tileLayerRef.current = L.tileLayer(url, { maxZoom: 19, subdomains: 'abcd' }).addTo(mapInstance.current);
    localStorage.setItem('lala-map-theme', isDark ? 'dark' : 'light');
  }, [isDark, loaded]);

  useEffect(() => {
    if (dist !== null && dist < 0.3 && navigating) {
      setNearbyAlert(true);
      setTimeout(() => setNearbyAlert(false), 7000);
    }
  }, [dist, navigating]);

 

  function addUserMarker(L: any, map: any, pos: { lat: number; lng: number }) {
    if (userMarkerRef.current) { try { map.removeLayer(userMarkerRef.current); } catch {} }
    const html = [
      '<div style="position:relative;width:28px;height:28px;">',
      '<div style="position:absolute;inset:0;border-radius:50%;background:rgba(232,184,109,0.3);animation:lala-pulse 2s infinite;"></div>',
      '<div style="position:absolute;inset:5px;border-radius:50%;background:linear-gradient(135deg,#E8B86D,#C8903D);border:2.5px solid white;box-shadow:0 0 16px rgba(232,184,109,0.8);"></div>',
      '<div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:#E8B86D;color:#0D0F14;font-size:9px;font-weight:800;padding:2px 6px;border-radius:10px;white-space:nowrap;">YOU</div>',
      '</div>',
    ].join('');
    const icon = L.divIcon({ className: '', html, iconAnchor: [14, 14] });
    userMarkerRef.current = L.marker([pos.lat, pos.lng], { icon, zIndexOffset: 1000 }).addTo(map);
  }

  const drawRoute = useCallback(async (from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    if (!L || !mapInstance.current) return;
    if (routeRef.current) {
      try { mapInstance.current.removeLayer(routeRef.current); } catch {}
      routeRef.current = null;
    }
    const profile = TRAVEL[mode].osrm;
    const url = `https://router.project-osrm.org/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
    setRouteLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('OSRM error');
      const data = await res.json();
      if (data.code !== 'Ok' || !data.routes?.[0]) throw new Error('No route');
      const route = data.routes[0];
      const distKm = route.distance / 1000;
      const durationMin = Math.round(route.duration / 60);
      const steps: string[] = [];
      if (route.legs?.[0]?.steps) {
        for (const step of route.legs[0].steps.slice(0, 5)) {
          const instr = step.maneuver?.instruction || step.name || '';
          if (instr && instr !== 'arrive') steps.push(instr);
        }
      }
      setRouteInfo({ distKm, durationMin, steps });
      const coords: [number, number][] = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
      routeRef.current = L.featureGroup([
        L.polyline(coords, { color: 'rgba(0,0,0,0.4)', weight: 12, opacity: 1, lineCap: 'round', lineJoin: 'round' }),
        L.polyline(coords, { color: '#E8B86D', weight: 7, opacity: 1, lineCap: 'round', lineJoin: 'round' }),
        L.polyline(coords, { color: '#FFF9E6', weight: 2, opacity: 0.7, lineCap: 'round', lineJoin: 'round', dashArray: '8,12' }),
      ]).addTo(mapInstance.current);
      mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [100, 100] });
    } catch {
      setRouteInfo(null);
      const mid1 = { lat: from.lat + (to.lat - from.lat) * 0.33 + (Math.random() - 0.5) * 0.004, lng: from.lng + (to.lng - from.lng) * 0.33 + (Math.random() - 0.5) * 0.006 };
      const mid2 = { lat: from.lat + (to.lat - from.lat) * 0.67 + (Math.random() - 0.5) * 0.004, lng: from.lng + (to.lng - from.lng) * 0.67 + (Math.random() - 0.5) * 0.006 };
      routeRef.current = L.polyline(
        [[from.lat, from.lng], [mid1.lat, mid1.lng], [mid2.lat, mid2.lng], [to.lat, to.lng]],
        { color: TRAVEL[mode].color, weight: 5, opacity: 0.85, dashArray: '14 7', lineCap: 'round', lineJoin: 'round' }
      ).addTo(mapInstance.current);
      mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [90, 90] });
    } finally {
      setRouteLoading(false);
    }
  }, [mode]);

  // Route only drawn on explicit user action (startNav) - not auto

  const startNav = useCallback(() => {
    const effectiveTarget = targetCoords || (searchPin ? { lat: searchPin.lat, lng: searchPin.lng } : null);
    if (!effectiveTarget) return;
    setNavigating(true);
    setShowTips(true);
    const fromPos = userPos || (mapInstance.current ? { lat: mapInstance.current.getCenter().lat, lng: mapInstance.current.getCenter().lng } : null);
    if (fromPos) drawRoute(fromPos, effectiveTarget);
    watchIdRef.current = navigator.geolocation?.watchPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setGpsError(false);
        if (L && mapInstance.current) {
          addUserMarker(L, mapInstance.current, p);
          if (effectiveTarget) drawRoute(p, effectiveTarget);
        }
      },
      () => setGpsError(true),
      { enableHighAccuracy: true, maximumAge: 2000 }
    ) as unknown as number;
  }, [targetCoords, userPos, drawRoute]);

  const stopNav = useCallback(() => {
    setNavigating(false);
    setShowTips(false);
    setRouteInfo(null);
    setRouteLoading(false);
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (routeRef.current && mapInstance.current) { try { mapInstance.current.removeLayer(routeRef.current); routeRef.current = null; } catch {} }
  }, []);

  const startSharingLocation = useCallback((bookingId: string) => {
    if (!currentUser?.id) return;
    setIsSharingLocation(true);
    setActiveBookingId(bookingId);
    guestShareRef.current = navigator.geolocation?.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, heading, speed } = pos.coords;
        setUserPos({ lat, lng });
        if (L && mapInstance.current) addUserMarker(L, mapInstance.current, { lat, lng });
        await supabase.from('guest_locations').upsert({
          user_id: currentUser.id,
             

          booking_id: bookingId,
          lat,
          lng,
          accuracy_m: accuracy ?? null,
          heading: heading ?? null,
          speed_kmh: speed != null ? speed * 3.6 : null,
          travel_mode: mode,
          is_sharing: true,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    ) as unknown as number;
  }, [currentUser?.id, mode]);

  const stopSharingLocation = useCallback(async () => {
    setIsSharingLocation(false);
    if (guestShareRef.current !== null) {
      navigator.geolocation?.clearWatch(guestShareRef.current);
      guestShareRef.current = null;
    }
    if (currentUser?.id) {
      await supabase.from('guest_locations').update({ is_sharing: false }).eq('user_id', currentUser.id);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser?.role !== 'host' || !currentUser?.id) return;

    const fetchGuestLocations = async () => {
      const { data } = await supabase
        .from('guest_locations')
        .select(`
          user_id, lat, lng, accuracy_m, heading, speed_kmh,
          travel_mode, is_sharing, updated_at,
          bookings!booking_id (
            id, guest_name, check_in, check_out, booking_status,
            property_id,
            properties!property_id ( title, host_id )
          )
        `)
        .eq('is_sharing', true);
      if (data) {
        const filtered = data.filter((g: any) =>
          g.bookings?.properties?.host_id === currentUser.id &&
          ['confirmed', 'in_stay'].includes(g.bookings?.booking_status)
        );
        setLiveGuests(filtered);
      }
    };

    fetchGuestLocations();

    const channel = supabase
      .channel('host-guest-locations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_locations' }, () => {
        fetchGuestLocations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!L || !mapInstance.current || !loaded || currentUser?.role !== 'host') return;
    guestMarkersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch {} });
    guestMarkersRef.current.clear();
    liveGuests.forEach((g: any) => {
      if (!g.is_sharing || !g.lat || !g.lng) return;
      const name = g.bookings?.guest_name || 'Guest';
      const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      const isStale = Date.now() - new Date(g.updated_at).getTime() > 60000;
      const pulse = isStale ? 'none' : 'lala-pulse 2s infinite';
      const html = [
        '<div style="position:relative;display:flex;flex-direction:column;align-items:center;">',
        `<div style="position:absolute;inset:0;border-radius:50%;background:rgba(62,207,178,0.3);animation:${pulse};width:36px;height:36px;"></div>`,
        `<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3ECFB2,#2AA893);border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#0D0F14;box-shadow:0 0 16px rgba(62,207,178,0.6);z-index:1;">${initials}</div>`,
        `<div style="background:#3ECFB2;color:#0D0F14;font-size:9px;font-weight:800;padding:2px 6px;border-radius:10px;white-space:nowrap;margin-top:2px;box-shadow:0 2px 8px rgba(0,0,0,0.3);">${name.split(' ')[0]}${isStale ? ' (offline)' : ' 🟢'}</div>`,
        '</div>',
      ].join('');
      const icon = L.divIcon({ className: '', html, iconAnchor: [18, 18] });
      const marker = L.marker([g.lat, g.lng], { icon, zIndexOffset: 900 }).addTo(mapInstance.current);
      guestMarkersRef.current.set(g.user_id, marker);
    });
  }, [liveGuests, loaded, currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role !== 'guest' || !currentUser?.id) return;
    const checkActiveBooking = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('bookings')
        .select('id, booking_status, check_in, check_out')
        .eq('guest_id', currentUser.id)
        .in('booking_status', ['confirmed', 'in_stay'])
        .lte('check_in', today)
        .gte('check_out', today)
        .limit(1)
        .single();
      if (data) setActiveBookingId(data.id);
    };
    checkActiveBooking();
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => {
    if (!L || !mapInstance.current || !loaded) return;
    propMarkersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch {} });
    propMarkersRef.current = [];
    filteredProps.forEach(prop => {
      const isSel = selected?.id === prop.id;
      const html = `<div style="background:${isSel ? '#0D0F14' : 'linear-gradient(135deg,#E8B86D,#C8903D)'};color:${isSel ? '#E8B86D' : '#0D0F14'};padding:5px 12px;border-radius:24px;font-size:12px;font-weight:800;white-space:nowrap;cursor:pointer;font-family:sans-serif;box-shadow:${isSel ? '0 6px 24px rgba(232,184,109,0.7)' : '0 3px 12px rgba(232,184,109,0.4)'};border:${isSel ? '2px solid #E8B86D' : '2px solid rgba(255,255,255,0.9)'};transform:${isSel ? 'scale(1.2)' : 'scale(1)'};transition:all 0.2s;">🏠 Ksh ${(prop.price / 1000).toFixed(0)}K</div>`;
      const icon = L.divIcon({ className: '', html, iconAnchor: [36, 14] });
      const m = L.marker([prop.coords.lat, prop.coords.lng], { icon }).addTo(mapInstance.current);
      m.on('click', () => { setSelected(prop); setSelectedLandmark(null); mapInstance.current?.flyTo([prop.coords.lat, prop.coords.lng], 15, { duration: 1 }); });
      propMarkersRef.current.push(m);
    });
  }, [filteredProps, loaded, selected]);

  useEffect(() => {
    if (!L || !mapInstance.current || !loaded) return;
    landmarkMarkersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch {} });
    landmarkMarkersRef.current = [];
    if (!showLandmarks) return;
    filteredLandmarks.forEach(lm => {
      const isSel = selectedLandmark?.name === lm.name;
      const bgColor = isDark ? '#1A1D27' : 'white';
      const textColor = isDark ? 'white' : '#0D0F14';
      const borderBase = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
      const html = [
        '<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">',
        `<div style="background:${bgColor};color:${isSel ? lm.color : textColor};padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;font-family:sans-serif;box-shadow:${isSel ? `0 4px 20px ${lm.color}80` : isDark ? '0 2px 12px rgba(0,0,0,0.6)' : '0 2px 8px rgba(0,0,0,0.2)'};border:${isSel ? `2px solid ${lm.color}` : `1.5px solid ${borderBase}`};transform:${isSel ? 'scale(1.15)' : 'scale(1)'};">${lm.icon} ${lm.short}</div>`,
        `<div style="width:2px;height:${isSel ? 8 : 6}px;background:${lm.color};margin-top:1px;border-radius:2px;"></div>`,
        '</div>',
      ].join('');
      const icon = L.divIcon({ className: '', html, iconAnchor: [0, isSel ? 24 : 20] });
      const m = L.marker([lm.lat, lm.lng], { icon }).addTo(mapInstance.current);
      m.on('click', () => { setSelectedLandmark(lm); setSelected(null); mapInstance.current?.flyTo([lm.lat, lm.lng], 16, { duration: 1 }); });
      landmarkMarkersRef.current.push(m);
    });
  }, [filteredLandmarks, loaded, showLandmarks, selectedLandmark, isDark]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [NAIROBI.lat, NAIROBI.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      tapTolerance: 15,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      bounceAtZoomLimits: false,
    });
    mapInstance.current = map;
    tileLayerRef.current = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 19, subdomains: 'abcd' }
    ).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const CreditControl = L.Control.extend({
      options: {
        position: 'bottomleft'
      },
      onAdd: function(map: L.Map) {
        const d = document.createElement('div');
        d.innerHTML = '<div style="background:rgba(13,15,20,0.9);color:#E8B86D;font-size:10px;font-weight:800;padding:4px 10px;border-radius:8px;font-family:sans-serif;letter-spacing:1px;">LALA KENYA</div>';
        return d;
      }
    });
    new CreditControl().addTo(map);
    navigator.geolocation?.getCurrentPosition(
      pos => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserPos(p); addUserMarker(L, map, p); },
      () => setGpsError(true),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!document.getElementById('lala-map-style')) {
      const s = document.createElement('style');
      s.id = 'lala-map-style';
      s.textContent = '@keyframes lala-pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(2.2);opacity:0}}.leaflet-container{font-family:sans-serif;}';
      document.head.appendChild(s);
    }
    initMap();
    return () => { stopNav(); if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  const flyToMe = () => {
    navigator.geolocation?.getCurrentPosition(pos => {
      const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserPos(p);
      if (L && mapInstance.current) addUserMarker(L, mapInstance.current, p);
      mapInstance.current?.flyTo([p.lat, p.lng], 15, { duration: 1.2 });
    });
  };


  const globalSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) { setSearchResults([]); setSearchLoading(false); return; }
    const lower = query.toLowerCase();
    const local: any[] = [];
    LANDMARKS.forEach((l: any) => {
      if (l.name.toLowerCase().includes(lower) || l.short.toLowerCase().includes(lower))
        local.push({ name: l.name, display: l.short, lat: l.lat, lng: l.lng, icon: l.icon, type: 'landmark', color: l.color });
    });
    propList.forEach((p: any) => {
      if (p.title.toLowerCase().includes(lower) || p.location.toLowerCase().includes(lower))
        local.push({ name: p.title, display: p.location, lat: p.coords.lat, lng: p.coords.lng, icon: '🏠', type: 'property', color: '#E8B86D', prop: p });
    });
    setSearchResults(local.slice(0, 5));
    setSearchLoading(true);
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(
        'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(query) + '&format=json&limit=7&addressdetails=1',
        { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
      );
      clearTimeout(tid);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const remote = data.map((r: any) => {
        const parts = r.display_name.split(',');
        const icon = r.type === 'restaurant' ? '🍽️' : r.type === 'hotel' ? '🏨' : r.type === 'hospital' ? '🏥' : r.class === 'highway' ? '🛣️' : r.class === 'natural' ? '🌿' : r.class === 'aeroway' ? '✈️' : '📍';
        return { name: r.display_name, display: parts.slice(0, 2).join(',').trim(), lat: parseFloat(r.lat), lng: parseFloat(r.lon), icon, type: 'nominatim', color: '#74B9FF' };
      });
      setSearchResults((prev: any[]) => [...prev.filter((r: any) => r.type !== 'nominatim'), ...remote]);
    } catch (e) {} finally { setSearchLoading(false); }
  };

  const jumpToResult = (result: any) => {
    console.log('JUMP TO:', result.name, result.lat, result.lng, 'map:', !!mapInstance.current);
    if (!mapInstance.current) return;
    if (result.type === 'property' && result.prop) {
      setSelected(result.prop); setSelectedLandmark(null);
      mapInstance.current.flyTo([result.lat, result.lng], 16, { duration: 1.2 });
    } else if (result.type === 'landmark') {
      const lm = LANDMARKS.find((l: any) => l.lat === result.lat && l.lng === result.lng);
      if (lm) { setSelectedLandmark(lm); setSelected(null); }
      mapInstance.current.flyTo([result.lat, result.lng], 16, { duration: 1.2 });
    } else {
      setSelected(null); setSelectedLandmark(null);
      if (searchPinMarkerRef.current) { try { mapInstance.current.removeLayer(searchPinMarkerRef.current); } catch(e){} }
      const label = result.display.slice(0, 22) + (result.display.length > 22 ? '...' : '');
      const pinHtml = '<div style="display:flex;flex-direction:column;align-items:center;"><div style="background:#E8B86D;color:#0D0F14;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:800;white-space:nowrap;box-shadow:0 4px 16px rgba(232,184,109,0.6);border:2px solid white;">' + result.icon + ' ' + label + '</div><div style="width:2px;height:8px;background:#E8B86D;margin-top:2px;"></div><div style="width:10px;height:10px;border-radius:50%;background:#E8B86D;"></div></div>';
      searchPinMarkerRef.current = L.marker([result.lat, result.lng], { icon: L.divIcon({ className: '', html: pinHtml, iconAnchor: [0, 30] }), zIndexOffset: 950 }).addTo(mapInstance.current);
      setSearchPin({ lat: result.lat, lng: result.lng, name: result.display });
      mapInstance.current.flyTo([result.lat, result.lng], 15, { duration: 1.4 });
    }
    const recent = { name: result.display, lat: result.lat, lng: result.lng, type: result.type, icon: result.icon };
    setRecentSearches((prev: any[]) => {
      const updated = [recent, ...prev.filter((r: any) => r.name !== recent.name)].slice(0, 5);
      localStorage.setItem('lala-map-recents', JSON.stringify(updated));
      return updated;
    });
    setSearch(''); setSearchResults([]); setSearchOpen(false);
  };

  const clearSearchPin = () => {
    if (searchPinMarkerRef.current && mapInstance.current) {
      try { mapInstance.current.removeLayer(searchPinMarkerRef.current); } catch(e){}
      searchPinMarkerRef.current = null;
    }
    setSearchPin(null);
  };

  const [nearMeActive, setNearMeActive] = useState<string | null>(null);

  const doFindNearest = (cat: string, pos: { lat: number; lng: number }) => {
    if (cat === 'stays') {
      if (!propList.length) { setNearMeActive(null); return; }
      const nearest = propList.reduce((best:any,p:any) => haversineKm(pos,p.coords)<haversineKm(pos,best.coords)?p:best);
      setSelected(nearest); setSelectedLandmark(null);
      mapInstance.current?.flyTo([nearest.coords.lat,nearest.coords.lng],15,{duration:1.4});
      setTimeout(()=>setNearMeActive(null),2000); return;
    }
    const matches = LANDMARKS.filter(l => l.cat === cat);
    if (!matches.length) { setTimeout(() => setNearMeActive(null), 500); return; }
    const nearest = matches.reduce((best, l) =>
      haversineKm(pos, { lat: l.lat, lng: l.lng }) < haversineKm(pos, { lat: best.lat, lng: best.lng }) ? l : best
    );
    setSelectedLandmark(nearest);
    setSelected(null);
    mapInstance.current?.flyTo([nearest.lat, nearest.lng], 16, { duration: 1.4 });
    setTimeout(() => setNearMeActive(null), 2000);
  };

  const findNearest = (cat: string) => {
    setNearMeActive(cat);
    const pos = userPos || (mapInstance.current ? { lat: mapInstance.current.getCenter().lat, lng: mapInstance.current.getCenter().lng } : { lat: -1.2921, lng: 36.8219 });
    if (['nightlife','restaurant','supermarket'].includes(cat)) {
      const q = cat === 'nightlife' ? 'nightclub' : cat === 'restaurant' ? 'restaurant' : 'supermarket';
      fetch('https://nominatim.openstreetmap.org/search?q='+encodeURIComponent(q+' near Nairobi Kenya')+'&format=json&limit=1',{headers:{'Accept-Language':'en','User-Agent':'LalaKenyaApp/1.0'}})
        .then(r=>r.json()).then(data=>{
          if(data?.length){ const r=data[0]; mapInstance.current?.flyTo([parseFloat(r.lat),parseFloat(r.lon)],16,{duration:1.4}); }
          setTimeout(()=>setNearMeActive(null),2000);
        }).catch(()=>setTimeout(()=>setNearMeActive(null),500));
      return;
    }
    doFindNearest(cat, pos);
  };
  const cardOpen = (selected || selectedLandmark || searchPin) && !navigating;
  const bottomOffset = cardOpen ? 360 : 90;

  console.log("MAP BOTTOMNAV ROLE:", currentUser?.role, sessionStorage.getItem("lala-force-role"));

  return (
    <PhoneFrame>
      <div className="flex-1 relative overflow-hidden flex flex-col" style={{ background: isDark ? '#0D0F14' : '#f5f5f0' }}>
        <div className="absolute top-0 left-0 right-0 z-[1010] pt-10 px-4 pb-3"
          style={{ background: isDark ? 'linear-gradient(180deg,rgba(13,15,20,0.98) 78%,transparent)' : 'linear-gradient(180deg,rgba(255,255,250,0.98) 78%,transparent)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: isDark ? '#F9FAFB' : '#0D0F14' }}>🗺️ LALA Map</div>
              <div className="text-[11px] font-medium" style={{ color: isDark ? '#9CA3AF' : '#666' }}>
                Nairobi · {filteredProps.length} stays · {LANDMARKS.length} places
              </div>
            </div>
            <div className="flex gap-1.5">
              
              <button
                onClick={() => setIsDark(v => !v)}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center border-none cursor-pointer text-[16px]"
                style={{ background: isDark ? 'rgba(232,184,109,0.15)' : 'rgba(13,15,20,0.08)', border: isDark ? '1.5px solid rgba(232,184,109,0.3)' : '1.5px solid transparent' }}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
                {isDark ? '☀️' : '🌙'}
              </button>
              <button onClick={() => navigate('/home')}
                className="w-9 h-9 rounded-[10px] flex items-center justify-center border-none cursor-pointer text-[14px]"
                style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(13,15,20,0.08)', color: isDark ? 'white' : '#0D0F14' }}>✕</button>
            </div>
          </div>

          <div className="relative mb-2">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[12px]"
                style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(13,15,20,0.06)', border: searchOpen ? '1.5px solid rgba(232,184,109,0.5)' : isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(13,15,20,0.1)' }}>
                {searchLoading ? (
                  <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: '#E8B86D', borderTopColor: 'transparent' }} />
                ) : <span className="flex-shrink-0">🔍</span>}
                <input
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setSearchOpen(true);
                    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = setTimeout(() => globalSearch(e.target.value), 350);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={e => { if (e.key === 'Enter' && searchResults.length > 0) { jumpToResult(searchResults[0]); } else if (e.key === 'Enter' && search.trim()) { globalSearch(search); } }}
                  placeholder="Search anywhere — Mombasa, Eiffel Tower, hospitals..."
                  className="flex-1 bg-transparent outline-none border-none text-[13px]"
                  style={{ color: isDark ? '#F9FAFB' : '#0D0F14', minWidth: 0 }} />
                {(search || searchPin) && (
                  <button onClick={() => { setSearch(''); setSearchResults([]); setSearchOpen(false); clearSearchPin(); }}
                    className="border-none bg-transparent cursor-pointer flex-shrink-0 text-[16px]" style={{ color: '#999' }}>✕</button>
                )}
              </div>
              <button onClick={() => setShowLandmarks(v => !v)}
                className="px-3 py-2 rounded-[12px] border-none cursor-pointer text-[11px] font-bold flex-shrink-0"
                style={{ background: showLandmarks ? '#0D0F14' : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(13,15,20,0.08)', color: showLandmarks ? '#E8B86D' : '#666' }}>
                {showLandmarks ? '📍 ON' : '📍 OFF'}
              </button>
            </div>

            {searchOpen && (search.length >= 2 || recentSearches.length > 0) && (
              <div className="absolute left-0 right-0 z-[1020] rounded-[16px] overflow-hidden mt-1 max-h-[340px] overflow-y-auto search-results-dropdown"
                style={{ background: isDark ? '#1A1D27' : 'white', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                {search.length < 2 && recentSearches.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-[10px] font-bold" style={{ color: '#888', letterSpacing: 1 }}>RECENT</div>
                    {recentSearches.map((r: any, i: number) => (
                      <button key={i} onClick={() => jumpToResult(r)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 border-none cursor-pointer text-left"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <span className="text-[16px] flex-shrink-0">{r.icon || '🕐'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: isDark ? 'white' : '#0D0F14' }}>{r.display || r.name}</div>
                        </div>
                        <span className="text-[11px]" style={{ color: '#888' }}>→</span>
                      </button>
                    ))}
                  </div>
                )}
                {search.length >= 2 && searchResults.length === 0 && !searchLoading && (
                  <div className="px-4 py-6 text-center">
                    <div className="text-[28px] mb-2">🔍</div>
                    <div className="text-[13px] font-semibold" style={{ color: isDark ? '#aaa' : '#666' }}>No results for "{search}"</div>
                    <div className="text-[11px] mt-1" style={{ color: '#888' }}>Try a city, street, or landmark name</div>
                  </div>
                )}
                {searchResults.length > 0 && (
                  <div>
                    {searchResults.filter((r: any) => r.type !== 'nominatim').length > 0 && (
                      <div className="px-3 py-1.5 text-[10px] font-bold" style={{ color: '#E8B86D', letterSpacing: 1 }}>ON LALA MAP</div>
                    )}
                    {searchResults.filter((r: any) => r.type !== 'nominatim').map((r: any, i: number) => (
                      <button key={i} onClick={() => jumpToResult(r)}
                        className="w-full px-3 py-2.5 flex items-center gap-3 border-none cursor-pointer text-left"
                        style={{ background: 'transparent' }}
                        onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 text-[16px]"
                          style={{ background: r.color + '20' }}>{r.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ color: isDark ? 'white' : '#0D0F14' }}>{r.display}</div>
                          <div className="text-[11px] truncate" style={{ color: '#888' }}>{r.type === 'property' ? 'LALA Stay' : 'Landmark'}</div>
                        </div>
                        {userPos && <div className="text-[11px] font-bold flex-shrink-0" style={{ color: r.color }}>{fmtDist(haversineKm(userPos, { lat: r.lat, lng: r.lng }))}</div>}
                      </button>
                    ))}
                    {searchResults.filter((r: any) => r.type === 'nominatim').length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] font-bold" style={{ color: '#74B9FF', letterSpacing: 1 }}>🌍 GLOBAL RESULTS</div>
                        {searchResults.filter((r: any) => r.type === 'nominatim').map((r: any, i: number) => (
                          <div key={i} className="w-full px-3 py-2 flex items-center gap-2" onClick={() => jumpToResult(r)}
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 text-[15px]"
                              style={{ background: 'rgba(116,185,255,0.15)' }}>{r.icon}</div>
                            <button className="flex-1 min-w-0 text-left border-none bg-transparent cursor-pointer py-1" onClick={() => jumpToResult(r)}>
                              <div className="text-[12px] font-semibold truncate" style={{ color: isDark ? 'white' : '#0D0F14' }}>{r.display}</div>
                              <div className="text-[10px] truncate" style={{ color: '#888' }}>{r.name.split(',').slice(1, 3).join(',').trim()}</div>
                            </button>
                            <button onClick={() => { jumpToResult(r); setTimeout(() => { if (userPos) startNav(); }, 400); }}
                              className="px-2.5 py-1.5 rounded-[10px] border-none cursor-pointer text-[10px] font-bold flex-shrink-0"
                              style={{ background: 'rgba(232,184,109,0.15)', color: '#E8B86D' }}>
                              🧭 Nav
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {searchLoading && searchResults.length === 0 && (
                  <div className="px-4 py-5 flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: '#E8B86D', borderTopColor: 'transparent' }} />
                    <span className="text-[13px]" style={{ color: '#888' }}>Searching everywhere...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {searchPin && (
            <div className="mb-2 rounded-[12px] overflow-hidden"
              style={{ background: isDark ? 'rgba(232,184,109,0.08)' : 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.3)' }}>
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-[16px]">📍</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold truncate" style={{ color: '#E8B86D' }}>{searchPin.name}</div>
                  {userPos && <div className="text-[10px]" style={{ color: '#888' }}>{fmtDist(haversineKm(userPos, { lat: searchPin.lat, lng: searchPin.lng }))} away · {fmtEta(haversineKm(userPos, { lat: searchPin.lat, lng: searchPin.lng }), TRAVEL[mode].speed)} {TRAVEL[mode].icon}</div>}
                </div>
                <button onClick={() => mapInstance.current?.flyTo([searchPin.lat, searchPin.lng], 16, { duration: 1 })}
                  className="px-2.5 py-1.5 rounded-[8px] border-none cursor-pointer text-[10px] font-bold"
                  style={{ background: 'rgba(232,184,109,0.2)', color: '#E8B86D' }}>Zoom</button>
                <button onClick={clearSearchPin} className="w-6 h-6 flex items-center justify-center rounded-full border-none bg-transparent cursor-pointer text-[14px]" style={{ color: '#888' }}>✕</button>
              </div>
              <div className="flex gap-1.5 px-3 pb-2">
                {(Object.entries(TRAVEL) as [TMode, typeof TRAVEL[TMode]][]).map(([m, t]) => (
                  <button key={m} onClick={() => setMode(m)}
                    className="flex-1 py-1.5 rounded-[8px] border-none cursor-pointer text-[10px] font-bold"
                    style={{ background: mode === m ? `${t.color}25` : 'transparent', color: mode === m ? t.color : '#666', border: mode === m ? `1px solid ${t.color}50` : '1px solid rgba(255,255,255,0.06)' }}>
                    {t.icon} {t.label}
                  </button>
                ))}
                <button onClick={() => { if (userPos) startNav(); }}
                  className="px-3 py-1.5 rounded-[8px] border-none cursor-pointer text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg,#E8B86D,#C8903D)', color: '#0D0F14' }}>
                  🧭 Navigate
                </button>
              </div>
            </div>
          )}

          {showLandmarks && (
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {LANDMARK_CATS.map(c => (
                <button key={c.id} onClick={() => setLandmarkCat(c.id)}
                  className="px-2.5 py-1.5 rounded-[20px] text-[10px] whitespace-nowrap border-none cursor-pointer font-bold"
                  style={{ background: landmarkCat === c.id ? (isDark ? '#E8B86D' : '#0D0F14') : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(13,15,20,0.06)', color: landmarkCat === c.id ? (isDark ? '#0D0F14' : c.color) : isDark ? '#aaa' : '#777', border: landmarkCat === c.id ? 'none' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(13,15,20,0.1)' }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1.5 overflow-x-auto mt-2" style={{ scrollbarWidth: 'none' }}>
            {['All', 'Apartment', 'Studio', 'Penthouse', 'Villa'].map(f => (
              <button key={f} onClick={() => setPropFilter(f)}
                className="px-3 py-1.5 rounded-[20px] text-[10px] whitespace-nowrap border-none cursor-pointer font-bold"
                style={{ background: propFilter === f ? '#E8B86D' : 'rgba(13,15,20,0.06)', color: propFilter === f ? '#0D0F14' : '#777', border: propFilter === f ? 'none' : '1px solid rgba(13,15,20,0.1)' }}>
                {f}
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 overflow-x-auto mt-2 pb-1" style={{ scrollbarWidth: 'none' }}>
            <span className="text-[10px] font-bold flex-shrink-0 flex items-center px-1" style={{ color: isDark ? '#555' : '#aaa' }}>NEAR ME:</span>
            {([
              { cat: 'stays',      label: 'BnBs',      color: '#E8B86D' },
              { cat: 'nightlife',  label: 'Nightlife', color: '#A29BFE' },
              { cat: 'restaurant', label: 'Food',      color: '#E17055' },
              { cat: 'hospital',   label: 'Hospital',  color: '#FF6B6B' },
              { cat: 'transport',  label: 'Airport',   color: '#74B9FF' },
              { cat: 'mall',       label: 'Mall',      color: '#FF9F43' },
              { cat: 'area',       label: 'Areas',     color: '#FD79A8' },
            ] as const).map(q => (
              <button key={q.cat}
                onClick={() => findNearest(q.cat)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-[20px] text-[10px] whitespace-nowrap border-none cursor-pointer font-bold flex-shrink-0"
                style={{
                  background: nearMeActive === q.cat ? q.color : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(13,15,20,0.06)',
                  color: nearMeActive === q.cat ? '#0D0F14' : isDark ? '#aaa' : '#666',
                  border: nearMeActive === q.cat ? 'none' : isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(13,15,20,0.1)',
                  transition: 'all 0.2s',
                }}>
                {nearMeActive === q.cat ? 'Finding...' : q.label}
              </button>
            ))}
          </div>
        </div>
        {searchOpen && (
          <div className="absolute inset-0 z-[1009]" onClick={() => { setSearchOpen(false); setSearchResults([]); }} style={{ pointerEvents: searchOpen ? 'auto' : 'none', zIndex: 999 }} />
        )}
        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 0, touchAction: 'none' }} />

        <AnimatePresence>
          {!loaded && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center z-[999]" style={{ background: isDark ? '#0D0F14' : '#f5f5f0' }}>
              <div className="text-[60px] mb-4">🗺️</div>
              <div className="text-[18px] font-black mb-1" style={{ fontFamily: 'var(--font-playfair)', color: '#0D0F14' }}>LALA Map</div>
              <div className="text-[13px]" style={{ color: '#888' }}>Loading {LANDMARKS.length} Nairobi places...</div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {nearbyAlert && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="absolute left-4 right-4 z-[1005] rounded-[16px] p-4"
              style={{ top: 200, background: 'rgba(13,15,20,0.96)', border: '1.5px solid #E8B86D', boxShadow: '0 8px 32px rgba(232,184,109,0.4)' }}>
              <div className="flex items-center gap-3">
                <div className="text-[32px]">🎉</div>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: '#E8B86D' }}>You've almost arrived!</div>
                  <div className="text-[12px]" style={{ color: '#aaa' }}>{selected?.title || selectedLandmark?.name} is less than 300m away</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {navigating && (selected || selectedLandmark) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute left-4 right-4 z-[1003] rounded-[20px] p-4"
              style={{ top: 200, background: 'rgba(13,15,20,0.97)', border: `1.5px solid ${TRAVEL[mode].color}50`, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              {gpsError ? (
                <div className="flex items-center gap-3">
                  <span className="text-[24px]">📡</span>
                  <div>
                    <div className="text-[13px] font-bold" style={{ color: '#FF6B6B' }}>GPS Unavailable</div>
                    <div className="text-[11px]" style={{ color: '#aaa' }}>Enable location in browser settings</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-[30px]">{TRAVEL[mode].icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold mb-0.5" style={{ color: '#666', letterSpacing: 1 }}>NAVIGATING TO</div>
                      <div className="text-[14px] font-bold truncate" style={{ color: 'white' }}>{selected?.title || selectedLandmark?.name}</div>
                    </div>
                    <button onClick={stopNav} className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px] font-bold"
                      style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B' }}>End</button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-[12px] p-3 text-center" style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.2)' }}>
                      <div className="text-[18px] font-black" style={{ color: '#E8B86D', fontFamily: 'monospace' }}>
                        {routeInfo ? `${routeInfo.distKm.toFixed(1)}km` : dist !== null ? fmtDist(dist) : '...'}
                      </div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>
                        {routeInfo ? 'ROAD' : 'STRAIGHT'}
                      </div>
                    </div>
                    <div className="rounded-[12px] p-3 text-center" style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
                      <div className="text-[18px] font-black" style={{ color: '#3ECFB2', fontFamily: 'monospace' }}>
                        {routeInfo ? `${routeInfo.durationMin}m` : eta || '...'}
                      </div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>
                        {routeInfo ? 'REAL ETA' : 'ETA'}
                      </div>
                    </div>
                    <div className="rounded-[12px] p-3 text-center" style={{ background: `${TRAVEL[mode].color}18`, border: `1px solid ${TRAVEL[mode].color}30` }}>
                      <div className="text-[18px] font-black" style={{ color: TRAVEL[mode].color, fontFamily: 'monospace' }}>
                        {TRAVEL[mode].speed}<span className="text-[11px]">k</span>
                      </div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>KM/H</div>
                    </div>
                  </div>

                  {routeLoading && (
                    <div className="flex items-center gap-2 py-1">
                      <div className="w-4 h-4 rounded-full border-2 animate-spin"
                        style={{ borderColor: TRAVEL[mode].color, borderTopColor: 'transparent' }} />
                      <span className="text-[11px]" style={{ color: '#888' }}>Finding best road route...</span>
                    </div>
                  )}

                  {!routeLoading && routeInfo && (
                    <div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${TRAVEL[mode].color},#E8B86D)` }}
                          animate={{ width: `${Math.max(4, Math.min(96, 100 - (routeInfo.distKm / 15) * 100))}%` }}
                          transition={{ duration: 1 }} />
                      </div>
                      <div className="flex justify-between text-[10px]" style={{ color: '#888' }}>
                        <span>📍 You</span><span>🏁 Destination</span>
                      </div>
                      {routeInfo.steps.length > 0 && (
                        <div className="mt-2 rounded-[10px] p-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div className="text-[9px] font-bold mb-1" style={{ color: '#888', letterSpacing: 1 }}>NEXT TURNS</div>
                          {routeInfo.steps.slice(0, 3).map((s, i) => (
                            <div key={i} className="text-[10px] mb-0.5 flex items-center gap-1.5" style={{ color: '#ccc' }}>
                              <span style={{ color: TRAVEL[mode].color }}>→</span> {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!routeLoading && !routeInfo && dist !== null && (
                    <div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${TRAVEL[mode].color},#E8B86D)` }}
                          animate={{ width: `${Math.max(4, Math.min(96, 100 - (dist / 15) * 100))}%` }}
                          transition={{ duration: 1 }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1" style={{ color: '#888' }}>
                        <span>📍 You</span><span>🏁 Destination</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selectedLandmark && !navigating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="absolute left-3 right-3 z-[1002]" style={{ bottom: 76 }}>
              <div className="rounded-[22px] overflow-hidden"
                style={{ background: isDark ? 'rgba(13,15,20,0.97)' : 'rgba(255,255,255,0.97)', border: `1.5px solid ${selectedLandmark.color}40`, backdropFilter: 'blur(30px)', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[28px] flex-shrink-0"
                      style={{ background: `${selectedLandmark.color}15`, border: `1.5px solid ${selectedLandmark.color}30` }}>
                      {selectedLandmark.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold mb-0.5 leading-tight" style={{ color: isDark ? 'white' : '#0D0F14' }}>{selectedLandmark.name}</div>
                      <div className="text-[11px] px-2 py-0.5 rounded-[20px] inline-block font-bold"
                        style={{ background: `${selectedLandmark.color}20`, color: selectedLandmark.color }}>
                        {LANDMARK_CATS.find(c => c.id === selectedLandmark.cat)?.label || selectedLandmark.cat}
                      </div>
                    </div>
                    <button onClick={() => setSelectedLandmark(null)}
                      className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14 }}>✕</button>
                  </div>
                  {dist !== null && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]"
                        style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.3)' }}>
                        <span>📍</span><span className="text-[13px] font-bold" style={{ color: '#E8B86D' }}>{fmtDist(dist)} away</span>
                      </div>
                      {eta && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]"
                          style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.2)' }}>
                          <span>⏱</span><span className="text-[13px] font-bold" style={{ color: '#3ECFB2' }}>{eta} {TRAVEL[mode].icon}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    {(Object.entries(TRAVEL) as [TMode, typeof TRAVEL[TMode]][]).map(([m, t]) => (
                      <button key={m} onClick={() => setMode(m)}
                        className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer flex flex-col items-center gap-0.5"
                        style={{ background: mode === m ? `${t.color}20` : 'rgba(255,255,255,0.04)', border: mode === m ? `1.5px solid ${t.color}50` : '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-[16px]">{t.icon}</span>
                        <span className="text-[9px] font-bold" style={{ color: mode === m ? t.color : '#777' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={startNav}
                    className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px] font-bold"
                    style={{ background: 'linear-gradient(135deg,#E8B86D,#C8903D)', color: '#0D0F14' }}>
                    🧭 Navigate to {selectedLandmark.short}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {selected && panel === 'guest' && !navigating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="absolute left-3 right-3 z-[1002]" style={{ bottom: 76 }}>
              <div className="rounded-[22px] overflow-hidden"
                style={{ background: isDark ? 'rgba(13,15,20,0.97)' : 'rgba(255,255,255,0.97)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(30px)', boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
                <div className="p-4 flex gap-3 items-center">
                  <div className="w-[72px] h-[72px] rounded-[14px] flex items-center justify-center text-[30px] flex-shrink-0 overflow-hidden"
                    style={{ background: 'linear-gradient(135deg,rgba(232,184,109,0.15),rgba(62,207,178,0.08))' }}>
                    {selected.image?.startsWith('http') ? <img src={selected.image} alt="" className="w-full h-full object-cover" /> : selected.image || '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold truncate mb-0.5" style={{ color: isDark ? 'white' : '#0D0F14' }}>{selected.title}</div>
                    <div className="text-[12px] mb-1" style={{ color: '#aaa' }}>📍 {selected.location}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold" style={{ color: '#E8B86D' }}>
                        Ksh {selected.price?.toLocaleString()}<span className="text-[11px] font-normal" style={{ color: '#888' }}>/night</span>
                      </span>
                      <span className="text-[12px]" style={{ color: '#aaa' }}>⭐ {selected.rating || '4.8'}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14 }}>✕</button>
                </div>

                {dist !== null && (
                  <div className="px-4 pb-3 flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]"
                      style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.3)' }}>
                      <span>📍</span><span className="text-[13px] font-bold" style={{ color: '#E8B86D' }}>{fmtDist(dist)} away</span>
                    </div>
                    {eta && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]"
                        style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.2)' }}>
                        <span>⏱</span><span className="text-[13px] font-bold" style={{ color: '#3ECFB2' }}>{eta} {TRAVEL[mode].icon}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: '#888', letterSpacing: 1 }}>NEARBY PLACES</div>
                  <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {LANDMARKS
                      .map(l => ({ ...l, d: haversineKm({ lat: l.lat, lng: l.lng }, selected.coords) }))
                      .sort((a, b) => a.d - b.d)
                      .slice(0, 6)
                      .map((l, i) => (
                        <div key={i} className="flex-shrink-0 px-2.5 py-1.5 rounded-[10px] text-[10px] font-bold"
                          style={{ background: `${l.color}18`, border: `1px solid ${l.color}30`, color: l.color, whiteSpace: 'nowrap' }}>
                          {l.icon} {l.short} · {fmtDist(l.d)}
                        </div>
                      ))}
                  </div>
                </div>

                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: '#888', letterSpacing: 1 }}>TRAVEL MODE</div>
                  <div className="flex gap-1.5">
                    {(Object.entries(TRAVEL) as [TMode, typeof TRAVEL[TMode]][]).map(([m, t]) => (
                      <button key={m} onClick={() => setMode(m)}
                        className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer flex flex-col items-center gap-0.5"
                        style={{ background: mode === m ? `${t.color}20` : 'rgba(255,255,255,0.04)', border: mode === m ? `1.5px solid ${t.color}50` : '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-[18px]">{t.icon}</span>
                        <span className="text-[9px] font-bold" style={{ color: mode === m ? t.color : '#777' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={startNav}
                    className="flex-1 py-3.5 rounded-[14px] border-none cursor-pointer flex items-center justify-center gap-2 text-[14px] font-bold"
                    style={{ background: 'linear-gradient(135deg,#E8B86D,#C8903D)', color: '#0D0F14' }}>
                    🧭 Navigate
                  </button>
                  <button onClick={() => navigate(`/property/${selected.id}`)}
                    className="flex-1 py-3.5 rounded-[14px] border-none cursor-pointer text-[14px] font-semibold"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'white' }}>
                    View Stay
                  </button>
                  <button onClick={() => navigate('/messages')}
                    className="w-12 py-3.5 rounded-[14px] border-none cursor-pointer flex items-center justify-center text-[20px]"
                    style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>💬</button>
                </div>

                {currentUser?.role === 'guest' && activeBookingId && (
                  <div className="px-4 pb-4">
                    <button
                      onClick={() => isSharingLocation ? stopSharingLocation() : startSharingLocation(activeBookingId)}
                      className="w-full py-3 rounded-[14px] border-none cursor-pointer text-[13px] font-bold flex items-center justify-center gap-2"
                      style={{
                        background: isSharingLocation ? 'rgba(62,207,178,0.15)' : 'rgba(255,255,255,0.05)',
                        border: isSharingLocation ? '1.5px solid rgba(62,207,178,0.4)' : '1.5px solid rgba(255,255,255,0.1)',
                        color: isSharingLocation ? '#3ECFB2' : '#aaa',
                      }}>
                      {isSharingLocation ? (
                        <><div className="w-2 h-2 rounded-full" style={{ background: '#3ECFB2', boxShadow: '0 0 6px #3ECFB2' }} /> Live location ON · Tap to stop</>
                      ) : (
                        <>📍 Share live location with host</>
                      )}
                    </button>
                    {isSharingLocation && (
                      <div className="text-[10px] text-center mt-1.5" style={{ color: '#555' }}>
                        Your host sees your location in real time
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          
        <button onClick={flyToMe}
          className="absolute z-[1002] w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer text-[20px]"
          style={{ right: 16, bottom: bottomOffset, background: 'rgba(13,15,20,0.92)', border: '1.5px solid rgba(232,184,109,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', transition: 'bottom 0.3s ease' }}>
          📍
        </button>

        {cardOpen && (
          <button onClick={() => setShowTips(v => !v)}
            className="absolute z-[1002] w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer text-[18px]"
            style={{ right: 16, bottom: bottomOffset + 56, background: showTips ? 'rgba(232,184,109,0.2)' : 'rgba(13,15,20,0.92)', border: showTips ? '1.5px solid rgba(232,184,109,0.5)' : '1.5px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', transition: 'bottom 0.3s ease' }}>
            💡
          </button>
        )}

        <AnimatePresence>
          {showTips && selected && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="absolute right-4 z-[1003] rounded-[16px] p-3 w-[200px]"
              style={{ bottom: bottomOffset + 120, background: 'rgba(13,15,20,0.96)', border: '1px solid rgba(232,184,109,0.2)', backdropFilter: 'blur(20px)' }}>
              <div className="text-[11px] font-bold mb-2" style={{ color: '#E8B86D', letterSpacing: 1 }}>💡 ARRIVAL TIPS</div>
              {[
                '🔑 Check-in code sent 30 min before arrival',
                '🅿️ Free parking — ask host for spot',
                '📞 Host responds in under 1 hour',
                '🏠 Look for the LALA Kenya sign at entrance',
                '🌍 Show this map to any local for directions',
              ].map((tip, i) => (
                <div key={i} className="text-[11px] mb-1.5 leading-relaxed" style={{ color: '#ccc' }}>{tip}</div>
              ))}
              <button onClick={() => setShowTips(false)} className="text-[10px] mt-1 border-none bg-transparent cursor-pointer" style={{ color: '#888' }}>Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>
        </AnimatePresence>

        {userPos && (
          <div className="absolute z-[1002] left-4" style={{ bottom: bottomOffset, transition: 'bottom 0.3s ease' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]"
              style={{ background: 'rgba(13,15,20,0.92)', border: '1px solid rgba(62,207,178,0.3)', backdropFilter: 'blur(20px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#3ECFB2', boxShadow: '0 0 8px #3ECFB2' }} />
              <span className="text-[11px] font-bold" style={{ color: '#3ECFB2' }}>
                {isSharingLocation ? 'Sharing live · GPS On' : 'GPS Live'}
              </span>
            </div>
          </div>
        )}

      </div>
      <BottomNav type={currentUser?.role === 'host' ? 'host' : 'guest'} />
    </PhoneFrame>
  );
}
