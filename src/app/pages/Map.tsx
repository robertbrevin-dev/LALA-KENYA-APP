import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import PhoneFrame from '../components/PhoneFrame';
import BottomNav from '../components/BottomNav';
import { useApp } from '../context/AppContext';

const NAIROBI = { lat: -1.286389, lng: 36.817223 };

const LANDMARKS = [
  // ── ICONIC / TOURIST ──
  { name: 'Kenyatta International Conference Centre', short: 'KICC', lat: -1.2864, lng: 36.8182, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Nairobi National Museum', short: 'National Museum', lat: -1.2732, lng: 36.8128, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Nairobi National Park', short: 'National Park', lat: -1.3600, lng: 36.8600, icon: '🦁', cat: 'nature', color: '#3ECFB2' },
  { name: 'David Sheldrick Wildlife Trust', short: 'Elephant Orphanage', lat: -1.3619, lng: 36.7731, icon: '🐘', cat: 'nature', color: '#3ECFB2' },
  { name: 'Giraffe Centre', short: 'Giraffe Centre', lat: -1.3742, lng: 36.7542, icon: '🦒', cat: 'nature', color: '#3ECFB2' },
  { name: 'Karura Forest', short: 'Karura Forest', lat: -1.2315, lng: 36.8220, icon: '🌲', cat: 'nature', color: '#3ECFB2' },
  { name: 'Nairobi Arboretum', short: 'Arboretum', lat: -1.2770, lng: 36.8108, icon: '🌳', cat: 'nature', color: '#3ECFB2' },
  { name: 'Uhuru Gardens', short: 'Uhuru Gardens', lat: -1.3081, lng: 36.8219, icon: '🌿', cat: 'landmark', color: '#E8B86D' },
  { name: 'Nairobi City Hall', short: 'City Hall', lat: -1.2850, lng: 36.8200, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Parliament Buildings Kenya', short: 'Parliament', lat: -1.2867, lng: 36.8193, icon: '🏛️', cat: 'landmark', color: '#E8B86D' },

  // ── TRANSPORT ──
  { name: 'Jomo Kenyatta International Airport', short: 'JKIA Airport', lat: -1.3192, lng: 36.9275, icon: '✈️', cat: 'transport', color: '#A29BFE' },
  { name: 'Wilson Airport', short: 'Wilson Airport', lat: -1.3213, lng: 36.8148, icon: '🛩️', cat: 'transport', color: '#A29BFE' },
  { name: 'Nairobi SGR Station Syokimau', short: 'SGR Syokimau', lat: -1.3500, lng: 36.9050, icon: '🚆', cat: 'transport', color: '#A29BFE' },
  { name: 'Nairobi Railway Station', short: 'Railway Station', lat: -1.2941, lng: 36.8284, icon: '🚉', cat: 'transport', color: '#A29BFE' },
  { name: 'Westlands Bus Terminal', short: 'Westlands Bus', lat: -1.2630, lng: 36.8050, icon: '🚌', cat: 'transport', color: '#A29BFE' },
  { name: 'Machakos Country Bus Station', short: 'Country Bus', lat: -1.2991, lng: 36.8370, icon: '🚌', cat: 'transport', color: '#A29BFE' },
  { name: 'Nairobi CBD Bus Stop — Kencom', short: 'Kencom Bus Stop', lat: -1.2869, lng: 36.8228, icon: '🚌', cat: 'transport', color: '#A29BFE' },

  // ── MALLS ──
  { name: 'Westgate Shopping Mall', short: 'Westgate Mall', lat: -1.2577, lng: 36.8058, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Junction Mall', short: 'Junction Mall', lat: -1.3002, lng: 36.7757, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Village Market', short: 'Village Market', lat: -1.2228, lng: 36.8059, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Garden City Mall', short: 'Garden City', lat: -1.2281, lng: 36.8918, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Two Rivers Mall', short: 'Two Rivers Mall', lat: -1.2071, lng: 36.7920, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'The Hub Karen', short: 'The Hub Karen', lat: -1.3241, lng: 36.7152, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Sarit Centre', short: 'Sarit Centre', lat: -1.2658, lng: 36.8035, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Yaya Centre', short: 'Yaya Centre', lat: -1.2930, lng: 36.7855, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Galleria Mall Langata', short: 'Galleria Mall', lat: -1.3380, lng: 36.7480, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'Prestige Plaza Ngong Road', short: 'Prestige Plaza', lat: -1.3040, lng: 36.7760, icon: '🛍️', cat: 'mall', color: '#FF9F43' },
  { name: 'T-Mall Langata Road', short: 'T-Mall', lat: -1.3320, lng: 36.7620, icon: '🛍️', cat: 'mall', color: '#FF9F43' },

  // ── HOSPITALS ──
  { name: 'Aga Khan University Hospital', short: 'Aga Khan Hospital', lat: -1.2607, lng: 36.8225, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Nairobi Hospital', short: 'Nairobi Hospital', lat: -1.2995, lng: 36.7903, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Kenyatta National Hospital', short: 'KNH', lat: -1.3003, lng: 36.8067, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'MP Shah Hospital', short: 'MP Shah Hospital', lat: -1.2666, lng: 36.8284, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: "Gertrude Garden Children's Hospital", short: "Gertrude's", lat: -1.2593, lng: 36.8284, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Karen Hospital', short: 'Karen Hospital', lat: -1.3200, lng: 36.7120, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },
  { name: 'Mater Hospital', short: 'Mater Hospital', lat: -1.3033, lng: 36.8500, icon: '🏥', cat: 'hospital', color: '#FF6B6B' },

  // ── UNIVERSITIES ──
  { name: 'University of Nairobi Main Campus', short: 'UoN Campus', lat: -1.2793, lng: 36.8175, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Kenyatta University', short: 'Kenyatta University', lat: -1.1808, lng: 36.9266, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Strathmore University', short: 'Strathmore', lat: -1.3083, lng: 36.8126, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'United States International University', short: 'USIU', lat: -1.2218, lng: 36.9050, icon: '🎓', cat: 'education', color: '#74B9FF' },
  { name: 'Daystar University', short: 'Daystar Uni', lat: -1.3108, lng: 36.8000, icon: '🎓', cat: 'education', color: '#74B9FF' },

  // ── BUSINESS / CBD ──
  { name: 'Nairobi CBD Central Business District', short: 'CBD Nairobi', lat: -1.2864, lng: 36.8172, icon: '🏙️', cat: 'landmark', color: '#E8B86D' },
  { name: 'Upperhill Business District', short: 'Upperhill', lat: -1.2991, lng: 36.8181, icon: '🏢', cat: 'landmark', color: '#E8B86D' },
  { name: 'Gigiri Diplomatic Zone UN HQ Africa', short: 'UN Gigiri', lat: -1.2240, lng: 36.8052, icon: '🌍', cat: 'landmark', color: '#E8B86D' },
  { name: 'Westlands Commercial District', short: 'Westlands', lat: -1.2650, lng: 36.8032, icon: '🏢', cat: 'landmark', color: '#E8B86D' },
  { name: 'Kilimani Residential Area', short: 'Kilimani', lat: -1.2921, lng: 36.7821, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Karen Residential Area', short: 'Karen', lat: -1.3186, lng: 36.7126, icon: '🏡', cat: 'area', color: '#FD79A8' },
  { name: 'Lavington Area', short: 'Lavington', lat: -1.2795, lng: 36.7689, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Runda Estate', short: 'Runda', lat: -1.2241, lng: 36.7821, icon: '🏡', cat: 'area', color: '#FD79A8' },
  { name: 'Muthaiga Estate', short: 'Muthaiga', lat: -1.2532, lng: 36.8414, icon: '🏡', cat: 'area', color: '#FD79A8' },
  { name: 'Langata Area', short: 'Langata', lat: -1.3488, lng: 36.7456, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'South B Residential', short: 'South B', lat: -1.3180, lng: 36.8320, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'South C Residential', short: 'South C', lat: -1.3260, lng: 36.8200, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Eastleigh Area', short: 'Eastleigh', lat: -1.2700, lng: 36.8550, icon: '🏘️', cat: 'area', color: '#FD79A8' },
  { name: 'Parklands Area', short: 'Parklands', lat: -1.2589, lng: 36.8189, icon: '🏘️', cat: 'area', color: '#FD79A8' },

  // ── FAST FOOD CHAINS ──
  { name: 'KFC Junction Mall', short: 'KFC Junction', lat: -1.3005, lng: 36.7760, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'KFC Westlands', short: 'KFC Westlands', lat: -1.2660, lng: 36.8040, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'KFC Sarit Centre', short: 'KFC Sarit', lat: -1.2655, lng: 36.8038, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'KFC Garden City', short: 'KFC Garden City', lat: -1.2285, lng: 36.8920, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: "Chicken Inn Westlands", short: 'Chicken Inn Westlands', lat: -1.2653, lng: 36.8044, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'Chicken Inn CBD', short: 'Chicken Inn CBD', lat: -1.2845, lng: 36.8205, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'Pizza Inn Westlands', short: 'Pizza Inn Westlands', lat: -1.2648, lng: 36.8046, icon: '🍕', cat: 'fastfood', color: '#E17055' },
  { name: "Domino's Pizza Two Rivers", short: "Domino's Two Rivers", lat: -1.2075, lng: 36.7923, icon: '🍕', cat: 'fastfood', color: '#E17055' },
  { name: "Domino's Pizza Garden City", short: "Domino's Garden City", lat: -1.2280, lng: 36.8922, icon: '🍕', cat: 'fastfood', color: '#E17055' },
  { name: 'Subway Westgate Mall', short: 'Subway Westgate', lat: -1.2580, lng: 36.8062, icon: '🥖', cat: 'fastfood', color: '#E17055' },
  { name: 'Steers Junction Mall', short: 'Steers Junction', lat: -1.3008, lng: 36.7755, icon: '🍔', cat: 'fastfood', color: '#E17055' },
  { name: 'Galitos Westlands', short: "Galito's Westlands", lat: -1.2644, lng: 36.8050, icon: '🍗', cat: 'fastfood', color: '#E17055' },
  { name: 'Big Square Junction Mall', short: 'Big Square', lat: -1.3000, lng: 36.7762, icon: '🍔', cat: 'fastfood', color: '#E17055' },
  { name: 'McDonalds Westgate', short: "McDonald's Westgate", lat: -1.2576, lng: 36.8060, icon: '🍔', cat: 'fastfood', color: '#E17055' },
  { name: 'Burger King Two Rivers', short: 'Burger King', lat: -1.2073, lng: 36.7921, icon: '🍔', cat: 'fastfood', color: '#E17055' },

  // ── COFFEE & CAFE ──
  { name: 'Java House Westlands', short: 'Java Westlands', lat: -1.2646, lng: 36.8042, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Java House Junction Mall', short: 'Java Junction', lat: -1.3002, lng: 36.7757, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Java House CBD', short: 'Java CBD', lat: -1.2855, lng: 36.8195, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Java House Village Market', short: 'Java Village Market', lat: -1.2232, lng: 36.8061, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Artcaffe Westgate', short: 'Artcaffe Westgate', lat: -1.2579, lng: 36.8056, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Artcaffe Hurlingham', short: 'Artcaffe Hurlingham', lat: -1.2990, lng: 36.7825, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Dormans Coffee Westlands', short: 'Dormans Westlands', lat: -1.2640, lng: 36.8048, icon: '☕', cat: 'cafe', color: '#FDCB6E' },
  { name: 'Nairobi Java House Karen', short: 'Java Karen', lat: -1.3238, lng: 36.7148, icon: '☕', cat: 'cafe', color: '#FDCB6E' },

  // ── RESTAURANTS ──
  { name: 'Carnivore Restaurant Langata', short: 'Carnivore', lat: -1.3336, lng: 36.7761, icon: '🍖', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Mama Oliech Restaurant Hurlingham', short: 'Mama Oliech', lat: -1.2960, lng: 36.7840, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Nyama Mama Westgate', short: 'Nyama Mama', lat: -1.2581, lng: 36.8054, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'The Talisman Restaurant Karen', short: 'Talisman Karen', lat: -1.3180, lng: 36.7130, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'About Thyme Restaurant', short: 'About Thyme', lat: -1.2998, lng: 36.7890, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Tin Roof Cafe Lavington', short: 'Tin Roof Cafe', lat: -1.2800, lng: 36.7700, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Lord Erroll Restaurant Runda', short: 'Lord Erroll', lat: -1.2250, lng: 36.7830, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Seven Seafood & Grill Westlands', short: 'Seven Seafood', lat: -1.2642, lng: 36.8036, icon: '🐟', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Tamarind Restaurant Westlands', short: 'Tamarind', lat: -1.2650, lng: 36.8030, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Mediterra Restaurant Kilimani', short: 'Mediterra', lat: -1.2920, lng: 36.7818, icon: '🍽️', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Furusato Japanese Restaurant', short: 'Furusato', lat: -1.2660, lng: 36.8028, icon: '🍣', cat: 'restaurant', color: '#FDCB6E' },
  { name: 'Chopstix Noodle Bar Westlands', short: 'Chopstix', lat: -1.2648, lng: 36.8052, icon: '🍜', cat: 'restaurant', color: '#FDCB6E' },

  // ── NIGHTLIFE & CLUBS ──
  { name: 'The Alchemist Bar Westlands', short: 'Alchemist', lat: -1.2643, lng: 36.8040, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Brew Bistro & Lounge Westlands', short: 'Brew Bistro', lat: -1.2638, lng: 36.8044, icon: '🍺', cat: 'nightlife', color: '#A29BFE' },
  { name: 'B Club Westlands', short: 'B Club', lat: -1.2652, lng: 36.8038, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'K1 Klubhouse Karen', short: 'K1 Klubhouse', lat: -1.3190, lng: 36.7140, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Club Havana Westlands', short: 'Club Havana', lat: -1.2656, lng: 36.8042, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Skylux Rooftop Kilimani', short: 'Skylux Rooftop', lat: -1.2918, lng: 36.7815, icon: '🌃', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Mercury Lounge Westlands', short: 'Mercury Lounge', lat: -1.2644, lng: 36.8046, icon: '🎵', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Nairobi Garage Westlands', short: 'Nairobi Garage', lat: -1.2636, lng: 36.8048, icon: '🎸', cat: 'nightlife', color: '#A29BFE' },
  { name: 'The Heron Portico Hotel Bar', short: 'Heron Bar', lat: -1.2980, lng: 36.7850, icon: '🍸', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Tacos Westlands', short: 'Tacos Club', lat: -1.2650, lng: 36.8040, icon: '🎶', cat: 'nightlife', color: '#A29BFE' },
  { name: 'Radio Bar Westlands', short: 'Radio Bar', lat: -1.2641, lng: 36.8043, icon: '📻', cat: 'nightlife', color: '#A29BFE' },
  { name: 'The Promenade Westlands', short: 'Promenade', lat: -1.2648, lng: 36.8035, icon: '🎉', cat: 'nightlife', color: '#A29BFE' },

  // ── SUPERMARKETS ──
  { name: 'Carrefour Two Rivers', short: 'Carrefour Two Rivers', lat: -1.2072, lng: 36.7918, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Carrefour Garden City', short: 'Carrefour Garden City', lat: -1.2283, lng: 36.8916, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Naivas Supermarket Westlands', short: 'Naivas Westlands', lat: -1.2655, lng: 36.8033, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Naivas Supermarket Junction', short: 'Naivas Junction', lat: -1.3001, lng: 36.7758, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'QuickMart Kilimani', short: 'QuickMart Kilimani', lat: -1.2919, lng: 36.7819, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Chandarana Supermarket Westlands', short: 'Chandarana', lat: -1.2660, lng: 36.8037, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Cleanshelf Supermarket Karen', short: 'Cleanshelf Karen', lat: -1.3195, lng: 36.7148, icon: '🛒', cat: 'supermarket', color: '#00B894' },
  { name: 'Uchumi Supermarket Ngong Road', short: 'Uchumi Ngong Rd', lat: -1.3040, lng: 36.7762, icon: '🛒', cat: 'supermarket', color: '#00B894' },

  // ── PETROL STATIONS ──
  { name: 'Shell Petrol Station Westlands', short: 'Shell Westlands', lat: -1.2668, lng: 36.8028, icon: '⛽', cat: 'petrol', color: '#FDCB6E' },
  { name: 'Total Energies Kilimani', short: 'Total Kilimani', lat: -1.2916, lng: 36.7823, icon: '⛽', cat: 'petrol', color: '#FDCB6E' },
  { name: 'Kenol Petrol Station CBD', short: 'Kenol CBD', lat: -1.2850, lng: 36.8240, icon: '⛽', cat: 'petrol', color: '#FDCB6E' },
  { name: 'Rubis Energy Ngong Road', short: 'Rubis Ngong Rd', lat: -1.3050, lng: 36.7770, icon: '⛽', cat: 'petrol', color: '#FDCB6E' },
  { name: 'Vivo Energy Shell Karen', short: 'Shell Karen', lat: -1.3200, lng: 36.7155, icon: '⛽', cat: 'petrol', color: '#FDCB6E' },

  // ── POLICE & SAFETY ──
  { name: 'Nairobi Central Police Station', short: 'Central Police', lat: -1.2875, lng: 36.8232, icon: '🚓', cat: 'safety', color: '#74B9FF' },
  { name: 'Kilimani Police Station', short: 'Kilimani Police', lat: -1.2940, lng: 36.7830, icon: '🚓', cat: 'safety', color: '#74B9FF' },
  { name: 'Westlands Police Station', short: 'Westlands Police', lat: -1.2635, lng: 36.8055, icon: '🚓', cat: 'safety', color: '#74B9FF' },
  { name: 'Karen Police Station', short: 'Karen Police', lat: -1.3195, lng: 36.7165, icon: '🚓', cat: 'safety', color: '#74B9FF' },
  { name: 'Langata Police Station', short: 'Langata Police', lat: -1.3480, lng: 36.7460, icon: '🚓', cat: 'safety', color: '#74B9FF' },

  // ── RELIGIOUS / CULTURAL ──
  { name: 'Jamia Mosque Nairobi CBD', short: 'Jamia Mosque', lat: -1.2830, lng: 36.8209, icon: '🕌', cat: 'cultural', color: '#A29BFE' },
  { name: 'All Saints Cathedral CBD', short: 'All Saints Cathedral', lat: -1.2864, lng: 36.8222, icon: '⛪', cat: 'cultural', color: '#A29BFE' },
  { name: 'Nairobi Chapel Ngong Road', short: 'Nairobi Chapel', lat: -1.2993, lng: 36.7882, icon: '⛪', cat: 'cultural', color: '#A29BFE' },
  { name: 'PCEA St Andrews Church', short: 'St Andrews Church', lat: -1.2870, lng: 36.8218, icon: '⛪', cat: 'cultural', color: '#A29BFE' },

  // ── HOTELS ──
  { name: 'Serena Hotel Nairobi', short: 'Serena Hotel', lat: -1.2876, lng: 36.8121, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Intercontinental Hotel Nairobi', short: 'Intercontinental', lat: -1.2868, lng: 36.8176, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Radisson Blu Upper Hill', short: 'Radisson Blu', lat: -1.2989, lng: 36.8172, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Villa Rosa Kempinski Nairobi', short: 'Kempinski Hotel', lat: -1.2912, lng: 36.7818, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Tribe Hotel Village Market', short: 'Tribe Hotel', lat: -1.2230, lng: 36.8055, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Hemingways Hotel Karen', short: 'Hemingways Karen', lat: -1.3215, lng: 36.7118, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
  { name: 'Ole Sereni Hotel Langata Road', short: 'Ole Sereni', lat: -1.3240, lng: 36.8160, icon: '🏨', cat: 'hotel', color: '#FD79A8' },
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
  walk:      { icon: '🚶', label: 'Walk',    speed: 5,  color: '#3ECFB2' },
  bicycle:   { icon: '🚴', label: 'Bicycle', speed: 15, color: '#E8B86D' },
  motorbike: { icon: '🏍️', label: 'Boda',   speed: 40, color: '#FF9F43' },
  car:       { icon: '🚗', label: 'Drive',   speed: 60, color: '#A29BFE' },
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
  { id: 'hospital',   label: '🏥 Hospitals',    color: '#FF6B6B' },
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
  return { lat: NAIROBI.lat + (Math.random() - 0.5) * 0.08, lng: NAIROBI.lng + (Math.random() - 0.5) * 0.08 };
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

export default function Map() {
  const navigate = useNavigate();
  const { properties, currentUser } = useApp();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const propMarkersRef = useRef<any[]>([]);
  const landmarkMarkersRef = useRef<any[]>([]);
  const routeRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

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
  const [panel, setPanel] = useState<'guest' | 'host'>('guest');
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [nearbyAlert, setNearbyAlert] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const propList = properties.map((p, i) => ({ ...p, coords: resolveCoords(p.location, i) }));
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
    if (dist !== null && dist < 0.3 && navigating) {
      setNearbyAlert(true);
      setTimeout(() => setNearbyAlert(false), 7000);
    }
  }, [dist, navigating]);

  // Default to host panel when a logged-in host opens the map
  useEffect(() => {
    if (currentUser?.role === 'host') {
      setPanel('host');
    }
  }, [currentUser?.role]);

  function addUserMarker(L: any, map: any, pos: { lat: number; lng: number }) {
    if (userMarkerRef.current) { try { map.removeLayer(userMarkerRef.current); } catch {} }
    const icon = L.divIcon({
      className: '',
      html: `<div style="position:relative;width:28px;height:28px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(232,184,109,0.3);animation:lala-pulse 2s infinite;"></div>
        <div style="position:absolute;inset:5px;border-radius:50%;background:linear-gradient(135deg,#E8B86D,#C8903D);border:2.5px solid white;box-shadow:0 0 16px rgba(232,184,109,0.8);"></div>
        <div style="position:absolute;top:-20px;left:50%;transform:translateX(-50%);background:#E8B86D;color:#0D0F14;font-size:9px;font-weight:800;padding:2px 6px;border-radius:10px;white-space:nowrap;">YOU</div>
      </div>`,
      iconAnchor: [14, 14],
    });
    userMarkerRef.current = L.marker([pos.lat, pos.lng], { icon, zIndexOffset: 1000 }).addTo(map);
  }

  const drawRoute = useCallback((from: { lat: number; lng: number }, to: { lat: number; lng: number }) => {
    const L = (window as any).L;
    if (!L || !mapInstance.current) return;
    if (routeRef.current) { try { mapInstance.current.removeLayer(routeRef.current); } catch {} }
    const mid = { lat: (from.lat + to.lat) / 2 + (Math.random() - 0.5) * 0.008, lng: (from.lng + to.lng) / 2 + (Math.random() - 0.5) * 0.012 };
    routeRef.current = (L as any).polyline(
      [[from.lat, from.lng], [mid.lat, mid.lng], [to.lat, to.lng]],
      { color: TRAVEL[mode].color, weight: 5, opacity: 0.9, dashArray: '14 7', lineCap: 'round', lineJoin: 'round' }
    ).addTo(mapInstance.current);
    mapInstance.current.fitBounds(routeRef.current.getBounds(), { padding: [90, 90] });
  }, [mode]);

  const startNav = useCallback(() => {
    if (!targetCoords) return;
    setNavigating(true);
    setShowTips(true);
    if (userPos) drawRoute(userPos, targetCoords);
    watchIdRef.current = navigator.geolocation?.watchPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserPos(p);
        setGpsError(false);
        const L = (window as any).L;
        if (L && mapInstance.current) {
          addUserMarker(L, mapInstance.current, p);
          if (targetCoords) drawRoute(p, targetCoords);
        }
      },
      () => setGpsError(true),
      { enableHighAccuracy: true, maximumAge: 2000 }
    ) as unknown as number;
  }, [targetCoords, userPos, drawRoute]);

  const stopNav = useCallback(() => {
    setNavigating(false);
    setShowTips(false);
    if (watchIdRef.current !== null) { navigator.geolocation.clearWatch(watchIdRef.current); watchIdRef.current = null; }
    if (routeRef.current && mapInstance.current) { try { mapInstance.current.removeLayer(routeRef.current); routeRef.current = null; } catch {} }
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current || !loaded) return;
    propMarkersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch {} });
    propMarkersRef.current = [];
    filteredProps.forEach(prop => {
      const isSel = selected?.id === prop.id;
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${isSel ? '#0D0F14' : 'linear-gradient(135deg,#E8B86D,#C8903D)'};color:${isSel ? '#E8B86D' : '#0D0F14'};padding:5px 12px;border-radius:24px;font-size:12px;font-weight:800;white-space:nowrap;cursor:pointer;font-family:sans-serif;box-shadow:${isSel ? '0 6px 24px rgba(232,184,109,0.7)' : '0 3px 12px rgba(232,184,109,0.4)'};border:${isSel ? '2px solid #E8B86D' : '2px solid rgba(255,255,255,0.9)'};transform:${isSel ? 'scale(1.2)' : 'scale(1)'};transition:all 0.2s;">🏠 Ksh ${(prop.price / 1000).toFixed(0)}K</div>`,
        iconAnchor: [36, 14],
      });
      const m = L.marker([prop.coords.lat, prop.coords.lng], { icon }).addTo(mapInstance.current);
      m.on('click', () => { setSelected(prop); setSelectedLandmark(null); mapInstance.current?.flyTo([prop.coords.lat, prop.coords.lng], 15, { duration: 1 }); });
      propMarkersRef.current.push(m);
    });
  }, [filteredProps, loaded, selected]);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapInstance.current || !loaded) return;
    landmarkMarkersRef.current.forEach(m => { try { mapInstance.current.removeLayer(m); } catch {} });
    landmarkMarkersRef.current = [];
    if (!showLandmarks) return;
    filteredLandmarks.forEach(lm => {
      const isSel = selectedLandmark?.name === lm.name;
      const icon = L.divIcon({
        className: '',
        html: `<div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="background:white;color:${lm.color};padding:3px 8px;border-radius:20px;font-size:11px;font-weight:700;white-space:nowrap;font-family:sans-serif;box-shadow:${isSel ? `0 4px 20px ${lm.color}80` : '0 2px 8px rgba(0,0,0,0.2)'};border:${isSel ? `2px solid ${lm.color}` : '1.5px solid rgba(0,0,0,0.08)'};transform:${isSel ? 'scale(1.15)' : 'scale(1)'};">${lm.icon} ${lm.short}</div>
          <div style="width:2px;height:${isSel ? '8' : '6'}px;background:${lm.color};margin-top:1px;border-radius:2px;"></div>
        </div>`,
        iconAnchor: [0, isSel ? 24 : 20],
      });
      const m = L.marker([lm.lat, lm.lng], { icon }).addTo(mapInstance.current);
      m.on('click', () => { setSelectedLandmark(lm); setSelected(null); mapInstance.current?.flyTo([lm.lat, lm.lng], 16, { duration: 1 }); });
      landmarkMarkersRef.current.push(m);
    });
  }, [filteredLandmarks, loaded, showLandmarks, selectedLandmark]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstance.current) return;
    const L = (window as any).L;
    const map = L.map(mapRef.current, {
      center: [NAIROBI.lat, NAIROBI.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      tap: true,
      tapTolerance: 15,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      bounceAtZoomLimits: false,
    });
    mapInstance.current = map;
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const credit = L.control({ position: 'bottomleft' });
    credit.onAdd = () => { const d = document.createElement('div'); d.innerHTML = `<div style="background:rgba(13,15,20,0.9);color:#E8B86D;font-size:10px;font-weight:800;padding:4px 10px;border-radius:8px;font-family:sans-serif;letter-spacing:1px;">LALA KENYA</div>`; return d; };
    credit.addTo(map);
    navigator.geolocation?.getCurrentPosition(pos => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserPos(p); addUserMarker(L, map, p); }, () => setGpsError(true), { enableHighAccuracy: true, timeout: 10000 });
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!document.getElementById('lala-map-style')) { const s = document.createElement('style'); s.id = 'lala-map-style'; s.textContent = `@keyframes lala-pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(2.2);opacity:0}}.leaflet-container{font-family:sans-serif;}`; document.head.appendChild(s); }
    if (!document.getElementById('leaflet-css')) { const l = document.createElement('link'); l.id = 'leaflet-css'; l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l); }
    if ((window as any).L) { initMap(); return; }
    const sc = document.createElement('script'); sc.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; sc.onload = () => initMap(); document.head.appendChild(sc);
    return () => { stopNav(); if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, []);

  const flyToMe = () => { navigator.geolocation?.getCurrentPosition(pos => { const p = { lat: pos.coords.latitude, lng: pos.coords.longitude }; setUserPos(p); const L = (window as any).L; if (L && mapInstance.current) addUserMarker(L, mapInstance.current, p); mapInstance.current?.flyTo([p.lat, p.lng], 15, { duration: 1.2 }); }); };

  const cardOpen = (selected || selectedLandmark) && !navigating;
  const bottomOffset = cardOpen ? 360 : 90;

  return (
    <PhoneFrame>
      <div className="flex-1 relative overflow-hidden flex flex-col" style={{ background: '#f5f5f0' }}>

        {/* HEADER */}
        <div className="absolute top-0 left-0 right-0 z-[1001] pt-10 px-4 pb-3"
          style={{ background: 'linear-gradient(180deg,rgba(255,255,250,0.98) 78%,transparent)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <div className="text-[18px] font-black" style={{ fontFamily: 'var(--font-playfair)', color: '#0D0F14' }}>🗺️ LALA Map</div>
              <div className="text-[11px] font-medium" style={{ color: '#666' }}>Nairobi · {filteredProps.length} stays · {LANDMARKS.length} places</div>
            </div>
            <div className="flex gap-1.5">
              <div className="flex rounded-[10px] overflow-hidden" style={{ border: '1.5px solid rgba(13,15,20,0.12)' }}>
                {(['guest', 'host'] as const).map(p => (
                  <button key={p} onClick={() => setPanel(p)} className="px-2.5 py-1.5 border-none cursor-pointer text-[10px] font-bold"
                    style={{ background: panel === p ? '#0D0F14' : 'transparent', color: panel === p ? '#E8B86D' : '#888' }}>
                    {p === 'guest' ? '🏨 Guest' : '🏠 Host'}
                  </button>
                ))}
              </div>
              <button onClick={() => navigate('/home')} className="w-9 h-9 rounded-[10px] flex items-center justify-center border-none cursor-pointer text-[14px]"
                style={{ background: 'rgba(13,15,20,0.08)', color: '#0D0F14' }}>✕</button>
            </div>
          </div>

          <div className="flex gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[12px]"
              style={{ background: 'rgba(13,15,20,0.06)', border: '1.5px solid rgba(13,15,20,0.1)' }}>
              <span>🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="KFC, Carnivore, Westgate..."
                className="flex-1 bg-transparent outline-none border-none text-[13px]" style={{ color: '#0D0F14' }} />
              {search && <button onClick={() => setSearch('')} className="border-none bg-transparent cursor-pointer" style={{ color: '#999' }}>✕</button>}
            </div>
            <button onClick={() => setShowLandmarks(v => !v)} className="px-3 py-2 rounded-[12px] border-none cursor-pointer text-[11px] font-bold"
              style={{ background: showLandmarks ? '#0D0F14' : 'rgba(13,15,20,0.08)', color: showLandmarks ? '#E8B86D' : '#666' }}>
              {showLandmarks ? '📍 ON' : '📍 OFF'}
            </button>
          </div>

          {showLandmarks && (
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {LANDMARK_CATS.map(c => (
                <button key={c.id} onClick={() => setLandmarkCat(c.id)} className="px-2.5 py-1.5 rounded-[20px] text-[10px] whitespace-nowrap border-none cursor-pointer font-bold"
                  style={{ background: landmarkCat === c.id ? '#0D0F14' : 'rgba(13,15,20,0.06)', color: landmarkCat === c.id ? c.color : '#777', border: landmarkCat === c.id ? 'none' : '1px solid rgba(13,15,20,0.1)' }}>
                  {c.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-1.5 overflow-x-auto mt-2" style={{ scrollbarWidth: 'none' }}>
            {['All', 'Apartment', 'Studio', 'Penthouse', 'Villa'].map(f => (
              <button key={f} onClick={() => setPropFilter(f)} className="px-3 py-1.5 rounded-[20px] text-[10px] whitespace-nowrap border-none cursor-pointer font-bold"
                style={{ background: propFilter === f ? '#E8B86D' : 'rgba(13,15,20,0.06)', color: propFilter === f ? '#0D0F14' : '#777', border: propFilter === f ? 'none' : '1px solid rgba(13,15,20,0.1)' }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 0, touchAction: 'none' }} />

        <AnimatePresence>
          {!loaded && (
            <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center z-[999]" style={{ background: '#f5f5f0' }}>
              <div className="text-[60px] mb-4">🗺️</div>
              <div className="text-[18px] font-black mb-1" style={{ fontFamily: 'var(--font-playfair)', color: '#0D0F14' }}>LALA Map</div>
              <div className="text-[13px]" style={{ color: '#888' }}>Loading {LANDMARKS.length} Nairobi places...</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {nearbyAlert && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute left-4 right-4 z-[1005] rounded-[16px] p-4"
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
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-4 right-4 z-[1003] rounded-[20px] p-4"
              style={{ top: 200, background: 'rgba(13,15,20,0.97)', border: `1.5px solid ${TRAVEL[mode].color}50`, boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              {gpsError ? (
                <div className="flex items-center gap-3"><span className="text-[24px]">📡</span><div><div className="text-[13px] font-bold" style={{ color: '#FF6B6B' }}>GPS Unavailable</div><div className="text-[11px]" style={{ color: '#aaa' }}>Enable location in browser settings</div></div></div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-[30px]">{TRAVEL[mode].icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold mb-0.5" style={{ color: '#666', letterSpacing: 1 }}>NAVIGATING TO</div>
                      <div className="text-[14px] font-bold truncate" style={{ color: 'white' }}>{selected?.title || selectedLandmark?.name}</div>
                    </div>
                    <button onClick={stopNav} className="px-3 py-1.5 rounded-[10px] border-none cursor-pointer text-[12px] font-bold" style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B' }}>End</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="rounded-[12px] p-3 text-center" style={{ background: 'rgba(232,184,109,0.1)', border: '1px solid rgba(232,184,109,0.2)' }}>
                      <div className="text-[20px] font-black" style={{ color: '#E8B86D', fontFamily: 'monospace' }}>{dist !== null ? fmtDist(dist) : '...'}</div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>DISTANCE</div>
                    </div>
                    <div className="rounded-[12px] p-3 text-center" style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>
                      <div className="text-[20px] font-black" style={{ color: '#3ECFB2', fontFamily: 'monospace' }}>{eta || '...'}</div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>ETA</div>
                    </div>
                    <div className="rounded-[12px] p-3 text-center" style={{ background: `${TRAVEL[mode].color}18`, border: `1px solid ${TRAVEL[mode].color}30` }}>
                      <div className="text-[20px] font-black" style={{ color: TRAVEL[mode].color, fontFamily: 'monospace' }}>{TRAVEL[mode].speed}<span className="text-[12px]">k</span></div>
                      <div className="text-[9px] font-bold mt-0.5" style={{ color: '#888', letterSpacing: 1 }}>KM/H</div>
                    </div>
                  </div>
                  {dist !== null && (
                    <div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${TRAVEL[mode].color},#E8B86D)` }} animate={{ width: `${Math.max(4, Math.min(96, 100 - (dist / 15) * 100))}%` }} transition={{ duration: 1 }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-1" style={{ color: '#888' }}><span>📍 You</span><span>🏁 Destination</span></div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedLandmark && !navigating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute left-3 right-3 z-[1002]" style={{ bottom: 76 }}>
              <div className="rounded-[22px] overflow-hidden" style={{ background: 'rgba(13,15,20,0.97)', border: `1.5px solid ${selectedLandmark.color}40`, backdropFilter: 'blur(30px)', boxShadow: '0 24px 60px rgba(0,0,0,0.7)' }}>
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-14 h-14 rounded-[14px] flex items-center justify-center text-[28px] flex-shrink-0" style={{ background: `${selectedLandmark.color}15`, border: `1.5px solid ${selectedLandmark.color}30` }}>{selectedLandmark.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold mb-0.5 leading-tight" style={{ color: 'white' }}>{selectedLandmark.name}</div>
                      <div className="text-[11px] px-2 py-0.5 rounded-[20px] inline-block font-bold" style={{ background: `${selectedLandmark.color}20`, color: selectedLandmark.color }}>
                        {LANDMARK_CATS.find(c => c.id === selectedLandmark.cat)?.label || selectedLandmark.cat}
                      </div>
                    </div>
                    <button onClick={() => setSelectedLandmark(null)} className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14 }}>✕</button>
                  </div>
                  {dist !== null && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]" style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.3)' }}>
                        <span>📍</span><span className="text-[13px] font-bold" style={{ color: '#E8B86D' }}>{fmtDist(dist)} away</span>
                      </div>
                      {eta && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.2)' }}>
                        <span>⏱</span><span className="text-[13px] font-bold" style={{ color: '#3ECFB2' }}>{eta} {TRAVEL[mode].icon}</span>
                      </div>}
                    </div>
                  )}
                  <div className="flex gap-1.5 mb-3">
                    {(Object.entries(TRAVEL) as [TMode, typeof TRAVEL[TMode]][]).map(([m, t]) => (
                      <button key={m} onClick={() => setMode(m)} className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer flex flex-col items-center gap-0.5"
                        style={{ background: mode === m ? `${t.color}20` : 'rgba(255,255,255,0.04)', border: mode === m ? `1.5px solid ${t.color}50` : '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-[16px]">{t.icon}</span>
                        <span className="text-[9px] font-bold" style={{ color: mode === m ? t.color : '#777' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={startNav} className="w-full py-3.5 rounded-[14px] border-none cursor-pointer text-[14px] font-bold" style={{ background: 'linear-gradient(135deg,#E8B86D,#C8903D)', color: '#0D0F14' }}>
                    🧭 Navigate to {selectedLandmark.short}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selected && panel === 'guest' && !navigating && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="absolute left-3 right-3 z-[1002]" style={{ bottom: 76 }}>
              <div className="rounded-[22px] overflow-hidden" style={{ background: 'rgba(13,15,20,0.97)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(30px)', boxShadow: '0 24px 60px rgba(0,0,0,0.8)' }}>
                <div className="p-4 flex gap-3 items-center">
                  <div className="w-[72px] h-[72px] rounded-[14px] flex items-center justify-center text-[30px] flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,rgba(232,184,109,0.15),rgba(62,207,178,0.08))' }}>
                    {selected.image?.startsWith('http') ? <img src={selected.image} alt="" className="w-full h-full object-cover" /> : selected.image || '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold truncate mb-0.5" style={{ color: 'white' }}>{selected.title}</div>
                    <div className="text-[12px] mb-1" style={{ color: '#aaa' }}>📍 {selected.location}</div>
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold" style={{ color: '#E8B86D' }}>Ksh {selected.price?.toLocaleString()}<span className="text-[11px] font-normal" style={{ color: '#888' }}>/night</span></span>
                      <span className="text-[12px]" style={{ color: '#aaa' }}>⭐ {selected.rating || '4.8'}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer self-start" style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', fontSize: 14 }}>✕</button>
                </div>
                {dist !== null && (
                  <div className="px-4 pb-3 flex gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]" style={{ background: 'rgba(232,184,109,0.12)', border: '1px solid rgba(232,184,109,0.3)' }}>
                      <span>📍</span><span className="text-[13px] font-bold" style={{ color: '#E8B86D' }}>{fmtDist(dist)} away</span>
                    </div>
                    {eta && <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.08)', border: '1px solid rgba(62,207,178,0.2)' }}>
                      <span>⏱</span><span className="text-[13px] font-bold" style={{ color: '#3ECFB2' }}>{eta} {TRAVEL[mode].icon}</span>
                    </div>}
                  </div>
                )}
                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: '#888', letterSpacing: 1 }}>NEARBY PLACES</div>
                  <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    {LANDMARKS.map(l => ({ ...l, d: haversineKm({ lat: l.lat, lng: l.lng }, selected.coords) })).sort((a, b) => a.d - b.d).slice(0, 6).map((l, i) => (
                      <div key={i} className="flex-shrink-0 px-2.5 py-1.5 rounded-[10px] text-[10px] font-bold" style={{ background: `${l.color}18`, border: `1px solid ${l.color}30`, color: l.color, whiteSpace: 'nowrap' }}>
                        {l.icon} {l.short} · {fmtDist(l.d)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="text-[10px] font-bold mb-1.5" style={{ color: '#888', letterSpacing: 1 }}>TRAVEL MODE</div>
                  <div className="flex gap-1.5">
                    {(Object.entries(TRAVEL) as [TMode, typeof TRAVEL[TMode]][]).map(([m, t]) => (
                      <button key={m} onClick={() => setMode(m)} className="flex-1 py-2.5 rounded-[11px] border-none cursor-pointer flex flex-col items-center gap-0.5"
                        style={{ background: mode === m ? `${t.color}20` : 'rgba(255,255,255,0.04)', border: mode === m ? `1.5px solid ${t.color}50` : '1px solid rgba(255,255,255,0.08)' }}>
                        <span className="text-[18px]">{t.icon}</span>
                        <span className="text-[9px] font-bold" style={{ color: mode === m ? t.color : '#777' }}>{t.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <button onClick={startNav} className="flex-1 py-3.5 rounded-[14px] border-none cursor-pointer flex items-center justify-center gap-2 text-[14px] font-bold" style={{ background: 'linear-gradient(135deg,#E8B86D,#C8903D)', color: '#0D0F14' }}>🧭 Navigate</button>
                  <button onClick={() => navigate(`/property/${selected.id}`)} className="flex-1 py-3.5 rounded-[14px] border-none cursor-pointer text-[14px] font-semibold" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', color: 'white' }}>View Stay</button>
                  <button onClick={() => navigate('/messages')} className="w-12 py-3.5 rounded-[14px] border-none cursor-pointer flex items-center justify-center text-[20px]" style={{ background: 'rgba(62,207,178,0.1)', border: '1px solid rgba(62,207,178,0.2)' }}>💬</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {panel === 'host' && !navigating && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute left-4 right-4 z-[1003] rounded-[20px] overflow-hidden"
              style={{ top: 210, background: 'rgba(13,15,20,0.97)', border: '1.5px solid rgba(232,184,109,0.2)', backdropFilter: 'blur(24px)', boxShadow: '0 16px 40px rgba(0,0,0,0.7)' }}>
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <div><div className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'white' }}>🏠 Host Panel</div><div className="text-[11px]" style={{ color: '#888' }}>Real-time guest tracking</div></div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[20px]" style={{ background: 'rgba(62,207,178,0.12)', border: '1px solid rgba(62,207,178,0.3)' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3ECFB2', boxShadow: '0 0 6px #3ECFB2' }} /><span className="text-[10px] font-bold" style={{ color: '#3ECFB2' }}>LIVE</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="text-[10px] font-bold mb-2" style={{ color: '#888', letterSpacing: 1 }}>INCOMING GUESTS TODAY</div>
                {[
                  { name: 'Amina Hassan', eta: '12 min', dist: '4.2 km', mode: '🚗', status: 'approaching', checkin: 'Check-in 2:00 PM', from: 'JKIA Airport' },
                  { name: 'Kevin Ochieng', eta: '34 min', dist: '11.8 km', mode: '🏍️', status: 'onway', checkin: 'Check-in 4:00 PM', from: 'Westlands' },
                  { name: 'Sarah Mukasa', eta: '58 min', dist: '28 km', mode: '🚗', status: 'far', checkin: 'Check-in 6:00 PM', from: 'Uganda Border' },
                ].map((g, i) => (
                  <div key={i} className="rounded-[14px] p-3 mb-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
                        style={{ background: i === 0 ? 'linear-gradient(135deg,#E8B86D,#C8903D)' : i === 1 ? 'linear-gradient(135deg,#3ECFB2,#2AA893)' : 'linear-gradient(135deg,#A29BFE,#6C5CE7)', color: '#0D0F14' }}>
                        {g.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-bold truncate" style={{ color: 'white' }}>{g.name}</div>
                        <div className="text-[10px]" style={{ color: '#888' }}>From: {g.from} · {g.checkin}</div>
                      </div>
                      <div className="text-[10px] px-2 py-1 rounded-[20px] font-bold"
                        style={{ background: g.status === 'approaching' ? 'rgba(62,207,178,0.15)' : g.status === 'onway' ? 'rgba(232,184,109,0.15)' : 'rgba(162,155,254,0.15)', color: g.status === 'approaching' ? '#3ECFB2' : g.status === 'onway' ? '#E8B86D' : '#A29BFE' }}>
                        {g.status === 'approaching' ? '🟢 Near' : g.status === 'onway' ? '🟡 En route' : '🔵 Far'}
                      </div>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 rounded-[10px] p-2 text-center" style={{ background: 'rgba(232,184,109,0.08)' }}>
                        <div className="text-[13px] font-black" style={{ color: '#E8B86D' }}>{g.dist}</div><div className="text-[9px]" style={{ color: '#888' }}>DISTANCE</div>
                      </div>
                      <div className="flex-1 rounded-[10px] p-2 text-center" style={{ background: 'rgba(62,207,178,0.08)' }}>
                        <div className="text-[13px] font-black" style={{ color: '#3ECFB2' }}>{g.eta} {g.mode}</div><div className="text-[9px]" style={{ color: '#888' }}>ETA</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/messages')} className="flex-1 py-2 rounded-[10px] border-none cursor-pointer text-[11px] font-bold" style={{ background: 'rgba(62,207,178,0.12)', color: '#3ECFB2' }}>💬 Message</button>
                      <button className="flex-1 py-2 rounded-[10px] border-none cursor-pointer text-[11px] font-bold" style={{ background: 'rgba(232,184,109,0.12)', color: '#E8B86D' }}>📞 Call</button>
                      <button className="px-3 py-2 rounded-[10px] border-none cursor-pointer text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa' }}>🔑 Code</button>
                    </div>
                  </div>
                ))}
                <div className="text-[10px] font-bold mt-3 mb-2" style={{ color: '#888', letterSpacing: 1 }}>QUICK ACTIONS</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ icon: '🔑', label: 'Send Code' }, { icon: '📋', label: 'Check-in' }, { icon: '📍', label: 'Share Pin' }].map((a, i) => (
                    <button key={i} className="py-3 rounded-[12px] border-none cursor-pointer flex flex-col items-center gap-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[20px]">{a.icon}</span><span className="text-[10px]" style={{ color: '#aaa' }}>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button onClick={flyToMe} className="absolute z-[1002] w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer text-[20px]"
          style={{ right: 16, bottom: bottomOffset, background: 'rgba(13,15,20,0.92)', border: '1.5px solid rgba(232,184,109,0.3)', backdropFilter: 'blur(20px)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', transition: 'bottom 0.3s ease' }}>📍</button>

        {cardOpen && (
          <button onClick={() => setShowTips(v => !v)} className="absolute z-[1002] w-11 h-11 rounded-full flex items-center justify-center border-none cursor-pointer text-[18px]"
            style={{ right: 16, bottom: bottomOffset + 56, background: showTips ? 'rgba(232,184,109,0.2)' : 'rgba(13,15,20,0.92)', border: showTips ? '1.5px solid rgba(232,184,109,0.5)' : '1.5px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', transition: 'bottom 0.3s ease' }}>💡</button>
        )}

        <AnimatePresence>
          {showTips && selected && (
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="absolute right-4 z-[1003] rounded-[16px] p-3 w-[200px]"
              style={{ bottom: bottomOffset + 120, background: 'rgba(13,15,20,0.96)', border: '1px solid rgba(232,184,109,0.2)', backdropFilter: 'blur(20px)' }}>
              <div className="text-[11px] font-bold mb-2" style={{ color: '#E8B86D', letterSpacing: 1 }}>💡 ARRIVAL TIPS</div>
              {['🔑 Check-in code sent 30 min before arrival', '🅿️ Free parking — ask host for spot', '📞 Host responds in under 1 hour', '🏠 Look for the LALA Kenya sign at entrance', '🌍 Show this map to any local for directions'].map((tip, i) => (
                <div key={i} className="text-[11px] mb-1.5 leading-relaxed" style={{ color: '#ccc' }}>{tip}</div>
              ))}
              <button onClick={() => setShowTips(false)} className="text-[10px] mt-1 border-none bg-transparent cursor-pointer" style={{ color: '#888' }}>Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {userPos && (
          <div className="absolute z-[1002] left-4" style={{ bottom: bottomOffset, transition: 'bottom 0.3s ease' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px]" style={{ background: 'rgba(13,15,20,0.92)', border: '1px solid rgba(62,207,178,0.3)', backdropFilter: 'blur(20px)' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#3ECFB2', boxShadow: '0 0 8px #3ECFB2' }} />
              <span className="text-[11px] font-bold" style={{ color: '#3ECFB2' }}>GPS Live</span>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}