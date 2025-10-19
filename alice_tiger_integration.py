#!/usr/bin/env python3
"""
ALICE-Tiger Census Integration Tool
Joins ALICE data with real Census Tiger shapefiles for proper choropleth mapping
"""

import os
import pandas as pd
import geopandas as gpd
import zipfile
import tempfile
import json
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ALICETigerIntegrator:
    def __init__(self, data_dir="data/tiger", alice_dir="alice_clean_data", output_dir="alice_tiger_output"):
        self.data_dir = Path(data_dir)
        self.alice_dir = Path(alice_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
    def load_alice_data(self):
        """Load ALICE county data"""
        alice_file = self.alice_dir / "ALICE_Mapping_County_Data.csv"
        logger.info(f"Loading ALICE data from {alice_file}")
        
        df = pd.read_csv(alice_file)
        
        # Clean FIPS codes (remove decimals)
        df['FIPS'] = df['GEO id2'].astype(str).str.split('.').str[0].str.zfill(5)
        
        logger.info(f"Loaded {len(df)} ALICE county records")
        return df
    
    def extract_county_shapefile(self):
        """Extract and load county shapefile from Tiger data"""
        county_zip = self.data_dir / "GENZ" / "cb_2023_us_county_500k.zip"
        
        if not county_zip.exists():
            # Try alternative location
            county_zip = self.data_dir / "cb_2023_us_county_500k.zip"
            
        if not county_zip.exists():
            raise FileNotFoundError(f"County shapefile not found at {county_zip}")
        
        logger.info(f"Extracting county boundaries from {county_zip}")
        
        with tempfile.TemporaryDirectory() as temp_dir:
            with zipfile.ZipFile(county_zip, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            
            # Find the shapefile
            shp_files = list(Path(temp_dir).glob("*.shp"))
            if not shp_files:
                raise FileNotFoundError("No shapefile found in county zip")
            
            # Load with geopandas
            gdf = gpd.read_file(shp_files[0])
            logger.info(f"Loaded {len(gdf)} county boundaries")
            
            return gdf
    
    def create_county_choropleth_data(self):
        """Join ALICE data with county boundaries"""
        logger.info("Creating county choropleth data...")
        
        # Load data
        alice_df = self.load_alice_data()
        counties_gdf = self.extract_county_shapefile()
        
        # Ensure FIPS codes are strings and properly formatted
        counties_gdf['GEOID'] = counties_gdf['GEOID'].astype(str).str.zfill(5)
        alice_df['FIPS'] = alice_df['GEO id2'].astype(str).str.split('.').str[0].str.zfill(5)
        
        # Filter out rows with missing or invalid FIPS codes
        valid_fips_alice = alice_df[alice_df['FIPS'].str.len() == 5].copy()
        missing_fips_alice = alice_df[alice_df['FIPS'].str.len() != 5].copy()
        
        logger.info(f"ALICE records with valid FIPS: {len(valid_fips_alice)}")
        logger.info(f"ALICE records with missing FIPS: {len(missing_fips_alice)}")
        
        # Primary join on FIPS codes
        merged_gdf = counties_gdf.merge(
            valid_fips_alice, 
            left_on='GEOID', 
            right_on='FIPS', 
            how='left'
        )
        
        # Secondary join for missing FIPS using state and county name
        if len(missing_fips_alice) > 0:
            logger.info("Attempting secondary join using state and county names...")
            
            # Create state mapping for missing FIPS records
            state_mapping = {
                'Alabama': 'AL',
                'Alaska': 'AK', 
                'Arizona': 'AZ',
                'Arkansas': 'AR',
                'California': 'CA',
                'Colorado': 'CO',
                'Connecticut': 'CT',
                'Delaware': 'DE',
                'Florida': 'FL',
                'Georgia': 'GA',
                'Hawaii': 'HI',
                'Idaho': 'ID',
                'Illinois': 'IL',
                'Indiana': 'IN',
                'Iowa': 'IA',
                'Kansas': 'KS',
                'Kentucky': 'KY',
                'Louisiana': 'LA',
                'Maine': 'ME',
                'Maryland': 'MD',
                'Massachusetts': 'MA',
                'Michigan': 'MI',
                'Minnesota': 'MN',
                'Mississippi': 'MS',
                'Missouri': 'MO',
                'Montana': 'MT',
                'Nebraska': 'NE',
                'Nevada': 'NV',
                'New Hampshire': 'NH',
                'New Jersey': 'NJ',
                'New Mexico': 'NM',
                'New York': 'NY',
                'North Carolina': 'NC',
                'North Dakota': 'ND',
                'Ohio': 'OH',
                'Oklahoma': 'OK',
                'Oregon': 'OR',
                'Pennsylvania': 'PA',
                'Rhode Island': 'RI',
                'South Carolina': 'SC',
                'South Dakota': 'SD',
                'Tennessee': 'TN',
                'Texas': 'TX',
                'Utah': 'UT',
                'Vermont': 'VT',
                'Virginia': 'VA',
                'Washington': 'WA',
                'West Virginia': 'WV',
                'Wisconsin': 'WI',
                'Wyoming': 'WY'
            }
            
            missing_fips_alice['State_Abbr'] = missing_fips_alice['State'].map(state_mapping)
            
            # Try to match on state and county name
            for idx, alice_row in missing_fips_alice.iterrows():
                if pd.isna(alice_row['County']) or pd.isna(alice_row['State_Abbr']):
                    continue
                    
                # Find matching county in shapefile
                county_match = counties_gdf[
                    (counties_gdf['STUSPS'] == alice_row['State_Abbr']) & 
                    (counties_gdf['NAME'].str.lower() == alice_row['County'].lower())
                ]
                
                if len(county_match) == 1:
                    geoid = county_match.iloc[0]['GEOID']
                    # Update the merged data for this county
                    mask = merged_gdf['GEOID'] == geoid
                    for col in ['Households', 'Poverty_Percentage', 'ALICE_Percentage', 
                               'Below_ALICE_Threshold_Percentage', 'Above_ALICE_Percentage']:
                        if col in alice_row and pd.notna(alice_row[col]):
                            merged_gdf.loc[mask, col] = alice_row[col]
                    merged_gdf.loc[mask, 'State'] = alice_row['State']
                    merged_gdf.loc[mask, 'County'] = alice_row['County']
                    logger.info(f"Matched {alice_row['County']}, {alice_row['State']} via name lookup")
        
        logger.info(f"Merged {len(merged_gdf)} counties")
        logger.info(f"Counties with ALICE data: {merged_gdf['ALICE_Percentage'].notna().sum()}")
        
        # Clean up columns
        merged_gdf = merged_gdf.drop(columns=['FIPS'], errors='ignore')
        
        return merged_gdf
    
    def save_choropleth_data(self, gdf, format_types=['geojson', 'shapefile']):
        """Save choropleth data in various formats"""
        base_name = "alice_counties_choropleth"
        
        if 'geojson' in format_types:
            geojson_path = self.output_dir / f"{base_name}.geojson"
            logger.info(f"Saving GeoJSON to {geojson_path}")
            gdf.to_file(geojson_path, driver='GeoJSON')
        
        if 'shapefile' in format_types:
            shp_path = self.output_dir / f"{base_name}.shp"
            logger.info(f"Saving Shapefile to {shp_path}")
            gdf.to_file(shp_path, driver='ESRI Shapefile')
        
        # Save attribute data as CSV for reference
        csv_path = self.output_dir / f"{base_name}_data.csv"
        logger.info(f"Saving attribute data to {csv_path}")
        df_attrs = gdf.drop(columns=['geometry'])
        df_attrs.to_csv(csv_path, index=False)
        
        return geojson_path if 'geojson' in format_types else shp_path
    
    def create_web_ready_geojson(self, gdf, simplify_tolerance=0.01):
        """Create a web-optimized GeoJSON file"""
        logger.info("Creating web-optimized GeoJSON...")
        
        # Simplify geometries for web use
        gdf_simplified = gdf.copy()
        gdf_simplified['geometry'] = gdf_simplified['geometry'].simplify(simplify_tolerance)
        
        # Select key columns for web mapping
        web_columns = [
            'GEOID', 'NAME', 'State', 'County', 
            'Households', 'ALICE_Percentage', 'Poverty_Percentage',
            'Below_ALICE_Threshold_Percentage', 'Above_ALICE_Percentage',
            'GEO display_label', 'geometry'
        ]
        
        # Filter to existing columns
        available_columns = [col for col in web_columns if col in gdf_simplified.columns]
        web_gdf = gdf_simplified[available_columns].copy()
        
        # Save web-optimized version
        web_path = self.output_dir / "alice_counties_web.geojson"
        logger.info(f"Saving web-optimized GeoJSON to {web_path}")
        web_gdf.to_file(web_path, driver='GeoJSON')
        
        return web_path
    
    def create_summary_stats(self, gdf):
        """Create summary statistics file"""
        stats = {
            'total_counties': len(gdf),
            'counties_with_alice_data': gdf['ALICE_Percentage'].notna().sum(),
            'avg_alice_percentage': gdf['ALICE_Percentage'].mean(),
            'avg_poverty_percentage': gdf['Poverty_Percentage'].mean(),
            'total_households': gdf['Households'].sum(),
            'data_coverage_percent': (gdf['ALICE_Percentage'].notna().sum() / len(gdf)) * 100,
            'projection': str(gdf.crs) if gdf.crs else 'Unknown'
        }
        
        stats_path = self.output_dir / "alice_integration_stats.json"
        with open(stats_path, 'w') as f:
            json.dump(stats, f, indent=2, default=str)
        
        logger.info(f"Summary statistics saved to {stats_path}")
        return stats
    
    def run_integration(self):
        """Run the complete integration process"""
        logger.info("Starting ALICE-Tiger integration...")
        
        try:
            # Create choropleth data
            choropleth_gdf = self.create_county_choropleth_data()
            
            # Save in multiple formats
            main_file = self.save_choropleth_data(choropleth_gdf)
            
            # Create web-optimized version
            web_file = self.create_web_ready_geojson(choropleth_gdf)
            
            # Generate summary stats
            stats = self.create_summary_stats(choropleth_gdf)
            
            logger.info("Integration complete!")
            
            return {
                'choropleth_file': main_file,
                'web_file': web_file,
                'stats': stats,
                'output_dir': self.output_dir
            }
            
        except Exception as e:
            logger.error(f"Integration failed: {e}")
            raise

def main():
    """Main function"""
    integrator = ALICETigerIntegrator()
    result = integrator.run_integration()
    
    print("\n" + "="*60)
    print("ALICE-TIGER INTEGRATION COMPLETE")
    print("="*60)
    print(f"Output directory: {result['output_dir']}")
    print(f"Main choropleth file: {result['choropleth_file']}")
    print(f"Web-optimized file: {result['web_file']}")
    print("\nSummary Statistics:")
    for key, value in result['stats'].items():
        print(f"  {key}: {value}")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()