#!/usr/bin/env python3
"""
ALICE Data Cleaner - Creates clean datasets for mapping and analysis
"""

import pandas as pd
import numpy as np
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_clean_datasets():
    """Create cleaned versions of the ALICE data for mapping and analysis"""
    
    # Load the consolidated data
    county_df = pd.read_csv('alice_master_data/ALICE_Master_County_Data.csv')
    subcounty_df = pd.read_csv('alice_master_data/ALICE_Master_Subcounty_Data.csv')
    
    logger.info(f"Loaded {len(county_df):,} county records and {len(subcounty_df):,} subcounty records")
    
    # Create current year datasets (most recent data for mapping)
    current_county = county_df[county_df['Year'] == county_df['Year'].max()].copy()
    current_subcounty = subcounty_df[subcounty_df['Year'] == subcounty_df['Year'].max()].copy()
    
    logger.info(f"Current year datasets: {len(current_county):,} counties, {len(current_subcounty):,} subcounty areas")
    
    # Verify household counts
    total_households_current = current_county['Households'].sum()
    logger.info(f"Total households (current year): {total_households_current:,}")
    
    # Create output directory
    output_dir = Path('alice_clean_data')
    output_dir.mkdir(exist_ok=True)
    
    # Save current year datasets (best for mapping)
    current_county.to_csv(output_dir / 'ALICE_Current_County_Data.csv', index=False)
    current_county.to_excel(output_dir / 'ALICE_Current_County_Data.xlsx', index=False)
    
    current_subcounty.to_csv(output_dir / 'ALICE_Current_Subcounty_Data.csv', index=False)
    current_subcounty.to_excel(output_dir / 'ALICE_Current_Subcounty_Data.xlsx', index=False)
    
    # Create time series datasets (keep original for trend analysis)
    county_df.to_csv(output_dir / 'ALICE_TimeSeries_County_Data.csv', index=False)
    subcounty_df.to_csv(output_dir / 'ALICE_TimeSeries_Subcounty_Data.csv', index=False)
    
    # Create summary statistics
    stats = {
        'Current Year Data': county_df['Year'].max(),
        'Total Counties (Current)': len(current_county),
        'Total States': current_county['State'].nunique(),
        'Total Households (Current)': f"{total_households_current:,}",
        'Average ALICE Percentage': f"{current_county['ALICE_Percentage'].mean():.2f}%",
        'Average Below ALICE Threshold': f"{current_county['Below_ALICE_Threshold_Percentage'].mean():.2f}%",
        'Time Series Years Available': f"{county_df['Year'].min()}-{county_df['Year'].max()}",
        'Total Time Series Records': f"{len(county_df):,}"
    }
    
    # Save summary
    summary_df = pd.DataFrame([stats])
    summary_df.to_csv(output_dir / 'ALICE_Data_Summary.csv', index=False)
    
    # Create a mapping-ready dataset with key fields only
    mapping_fields = [
        'State', 'State Abbr', 'County', 'GEO id2', 'GEO display_label',
        'Households', 'Poverty_Percentage', 'ALICE_Percentage', 
        'Below_ALICE_Threshold_Percentage', 'Above_ALICE_Percentage'
    ]
    
    mapping_county = current_county[mapping_fields].copy()
    mapping_county.to_csv(output_dir / 'ALICE_Mapping_County_Data.csv', index=False)
    
    # Create subcounty mapping dataset
    subcounty_mapping_fields = [
        'State', 'Type', 'GEO id2', 'GEO display_label', 'County',
        'Households', 'Poverty_Percentage', 'ALICE_Percentage',
        'Below_ALICE_Threshold_Percentage', 'Above_ALICE_Percentage'
    ]
    
    mapping_subcounty = current_subcounty[subcounty_mapping_fields].copy()
    mapping_subcounty.to_csv(output_dir / 'ALICE_Mapping_Subcounty_Data.csv', index=False)
    
    print(f"""
ALICE Data Cleaning Complete!
=============================

CURRENT YEAR DATA (Best for Mapping & Database):
- Counties: {len(current_county):,} records
- Subcounty: {len(current_subcounty):,} records  
- Total Households: {total_households_current:,}
- Data Year: {county_df['Year'].max()}

TIME SERIES DATA (For Trend Analysis):
- Years: {county_df['Year'].min()}-{county_df['Year'].max()}
- County Records: {len(county_df):,}
- Subcounty Records: {len(subcounty_df):,}

FILES CREATED:
✓ ALICE_Current_County_Data.csv/xlsx - Latest data for all counties
✓ ALICE_Current_Subcounty_Data.csv/xlsx - Latest subcounty data
✓ ALICE_Mapping_County_Data.csv - Streamlined for mapping programs  
✓ ALICE_Mapping_Subcounty_Data.csv - Streamlined subcounty mapping
✓ ALICE_TimeSeries_County_Data.csv - Full historical data
✓ ALICE_TimeSeries_Subcounty_Data.csv - Full historical subcounty data
✓ ALICE_Data_Summary.csv - Key statistics

All files saved to: {output_dir.absolute()}
""")

if __name__ == "__main__":
    create_clean_datasets()