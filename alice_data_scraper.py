#!/usr/bin/env python3
"""
ALICE State Data Sheet Scraper
Downloads all available state ALICE Excel data sheets from unitedforalice.org
"""

import os
import time
import requests
from urllib.parse import urljoin
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configuration
BASE_URL = "https://www.unitedforalice.org"
DOWNLOAD_DIR = "alice_state_data"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

# All 50 states + DC + territories (using URL-friendly slugs)
ALL_STATES = [
    "alabama", "alaska", "arizona", "arkansas", "california", "colorado", 
    "connecticut", "delaware", "florida", "georgia", "hawaii", "idaho", 
    "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", 
    "maine", "maryland", "massachusetts", "michigan", "minnesota", 
    "mississippi", "missouri", "montana", "nebraska", "nevada", 
    "new-hampshire", "new-jersey", "new-mexico", "new-york", 
    "north-carolina", "north-dakota", "ohio", "oklahoma", "oregon", 
    "pennsylvania", "rhode-island", "south-carolina", "south-dakota", 
    "tennessee", "texas", "utah", "vermont", "virginia", "washington", 
    "west-virginia", "wisconsin", "wyoming", "district-of-columbia"
]

def create_download_directory():
    """Create download directory if it doesn't exist"""
    if not os.path.exists(DOWNLOAD_DIR):
        os.makedirs(DOWNLOAD_DIR)
        logger.info(f"Created download directory: {DOWNLOAD_DIR}")

def download_file(url, filename):
    """Download a file from URL to local directory"""
    filepath = os.path.join(DOWNLOAD_DIR, filename)
    
    # Skip if file already exists
    if os.path.exists(filepath):
        logger.info(f"File already exists, skipping: {filename}")
        return True
    
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        file_size = os.path.getsize(filepath)
        logger.info(f"Downloaded {filename} ({file_size:,} bytes)")
        return True
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to download {filename}: {e}")
        return False

def get_state_data_sheet(state_slug):
    """Attempt to download ALICE data sheet for a specific state"""
    
    # Try multiple possible URL patterns for the Excel file
    possible_urls = [
        f"/Attachments/StateDataSheet/2025 ALICE - {state_slug.replace('-', ' ').title()} Data Sheet.xlsx",
        f"/Attachments/StateDataSheet/2024 ALICE - {state_slug.replace('-', ' ').title()} Data Sheet.xlsx",
        f"/Attachments/StateDataSheet/2023 ALICE - {state_slug.replace('-', ' ').title()} Data Sheet.xlsx"
    ]
    
    # Special case mappings for states with different naming
    state_name_mappings = {
        "district-of-columbia": "District of Columbia",
        "new-hampshire": "New Hampshire", 
        "new-jersey": "New Jersey",
        "new-mexico": "New Mexico",
        "new-york": "New York",
        "north-carolina": "North Carolina", 
        "north-dakota": "North Dakota",
        "rhode-island": "Rhode Island",
        "south-carolina": "South Carolina",
        "south-dakota": "South Dakota",
        "west-virginia": "West Virginia"
    }
    
    state_display_name = state_name_mappings.get(state_slug, state_slug.replace('-', ' ').title())
    
    # Update URLs with proper state name
    possible_urls = [
        f"/Attachments/StateDataSheet/2025 ALICE - {state_display_name} Data Sheet.xlsx",
        f"/Attachments/StateDataSheet/2024 ALICE - {state_display_name} Data Sheet.xlsx", 
        f"/Attachments/StateDataSheet/2023 ALICE - {state_display_name} Data Sheet.xlsx"
    ]
    
    for url_path in possible_urls:
        full_url = urljoin(BASE_URL, url_path)
        filename = f"2025_ALICE_{state_display_name.replace(' ', '_')}_Data_Sheet.xlsx"
        
        logger.info(f"Trying to download: {state_display_name}")
        
        try:
            response = requests.head(full_url, headers=HEADERS, timeout=10)
            if response.status_code == 200:
                success = download_file(full_url, filename)
                if success:
                    return True
                    
        except requests.exceptions.RequestException:
            continue
    
    logger.warning(f"No data sheet found for: {state_display_name}")
    return False

def main():
    """Main function to download all state ALICE data sheets"""
    logger.info("Starting ALICE State Data Sheet download...")
    
    create_download_directory()
    
    successful_downloads = 0
    failed_states = []
    
    for state in ALL_STATES:
        logger.info(f"Processing state: {state}")
        
        success = get_state_data_sheet(state)
        if success:
            successful_downloads += 1
        else:
            failed_states.append(state)
        
        # Be polite to the server
        time.sleep(1)
    
    # Summary
    logger.info(f"\n=== DOWNLOAD SUMMARY ===")
    logger.info(f"Total states processed: {len(ALL_STATES)}")
    logger.info(f"Successful downloads: {successful_downloads}")
    logger.info(f"Failed downloads: {len(failed_states)}")
    
    if failed_states:
        logger.info(f"States with no data sheet found: {', '.join(failed_states)}")
    
    logger.info(f"All files saved to: {os.path.abspath(DOWNLOAD_DIR)}")

if __name__ == "__main__":
    main()