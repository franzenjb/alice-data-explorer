#!/usr/bin/env python3
"""
ALICE Data Consolidator
Combines all state ALICE Excel data sheets into master files for database and mapping use
"""

import os
import pandas as pd
import numpy as np
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ALICEDataConsolidator:
    def __init__(self, input_dir="alice_state_data", output_dir="alice_master_data"):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(exist_ok=True)
        
        # Master dataframes
        self.master_county = pd.DataFrame()
        self.master_subcounty = pd.DataFrame()
        self.processing_stats = {
            'files_processed': 0,
            'files_failed': 0,
            'total_counties': 0,
            'total_subcounty_areas': 0,
            'failed_files': []
        }
    
    def process_all_files(self):
        """Process all Excel files in the input directory"""
        logger.info(f"Processing files from: {self.input_dir}")
        
        excel_files = list(self.input_dir.glob("*.xlsx"))
        logger.info(f"Found {len(excel_files)} Excel files to process")
        
        for file_path in excel_files:
            try:
                self.process_single_file(file_path)
                self.processing_stats['files_processed'] += 1
            except Exception as e:
                logger.error(f"Failed to process {file_path.name}: {e}")
                self.processing_stats['files_failed'] += 1
                self.processing_stats['failed_files'].append(file_path.name)
        
        logger.info(f"Processing complete. {self.processing_stats['files_processed']} files processed, {self.processing_stats['files_failed']} failed")
    
    def process_single_file(self, file_path):
        """Process a single Excel file and add to master datasets"""
        state_name = self.extract_state_name(file_path.name)
        logger.info(f"Processing: {state_name}")
        
        try:
            # Read Excel file
            xl = pd.ExcelFile(file_path)
            
            # Process County data
            if 'County' in xl.sheet_names:
                county_df = pd.read_excel(file_path, sheet_name='County')
                county_df = self.clean_county_data(county_df, state_name)
                self.master_county = pd.concat([self.master_county, county_df], ignore_index=True)
                self.processing_stats['total_counties'] += len(county_df)
            
            # Process Subcounty data
            if 'Subcounty' in xl.sheet_names:
                subcounty_df = pd.read_excel(file_path, sheet_name='Subcounty')
                subcounty_df = self.clean_subcounty_data(subcounty_df, state_name)
                self.master_subcounty = pd.concat([self.master_subcounty, subcounty_df], ignore_index=True)
                self.processing_stats['total_subcounty_areas'] += len(subcounty_df)
                
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            raise
    
    def extract_state_name(self, filename):
        """Extract state name from filename"""
        # Format: 2025_ALICE_StateName_Data_Sheet.xlsx
        parts = filename.replace('.xlsx', '').split('_')
        if len(parts) >= 3:
            return '_'.join(parts[2:-2]).replace('_', ' ')
        return filename
    
    def clean_county_data(self, df, state_name):
        """Clean and standardize county data"""
        # Remove any completely empty rows
        df = df.dropna(how='all')
        
        # Ensure we have the expected columns
        expected_cols = ['State', 'Year', 'GEO id2', 'GEO display_label', 'County', 'State Abbr', 
                        'Households', 'Poverty Households', 'ALICE Households', 'Above ALICE Households',
                        'ALICE Threshold - HH under 65', 'ALICE Threshold - HH 65 years and over']
        
        # Keep only expected columns that exist
        existing_cols = [col for col in expected_cols if col in df.columns]
        df = df[existing_cols].copy()
        
        # Add calculated fields for analysis
        if all(col in df.columns for col in ['Households', 'Poverty Households', 'ALICE Households', 'Above ALICE Households']):
            df['Poverty_Percentage'] = (df['Poverty Households'] / df['Households'] * 100).round(2)
            df['ALICE_Percentage'] = (df['ALICE Households'] / df['Households'] * 100).round(2)
            df['Above_ALICE_Percentage'] = (df['Above ALICE Households'] / df['Households'] * 100).round(2)
            df['Below_ALICE_Threshold_Total'] = df['Poverty Households'] + df['ALICE Households']
            df['Below_ALICE_Threshold_Percentage'] = (df['Below_ALICE_Threshold_Total'] / df['Households'] * 100).round(2)
        
        # Add processing metadata
        df['Data_Source_File'] = state_name
        df['Processing_Date'] = pd.Timestamp.now().strftime('%Y-%m-%d')
        
        return df
    
    def clean_subcounty_data(self, df, state_name):
        """Clean and standardize subcounty data"""
        # Remove any completely empty rows
        df = df.dropna(how='all')
        
        # Ensure we have the expected columns
        expected_cols = ['State', 'Year', 'Type', 'GEO id2', 'GEO display_label', 
                        'Households', 'Poverty Households', 'ALICE Households', 'Above ALICE Households', 'County']
        
        # Keep only expected columns that exist
        existing_cols = [col for col in expected_cols if col in df.columns]
        df = df[existing_cols].copy()
        
        # Add calculated fields for analysis
        if all(col in df.columns for col in ['Households', 'Poverty Households', 'ALICE Households', 'Above ALICE Households']):
            df['Poverty_Percentage'] = (df['Poverty Households'] / df['Households'] * 100).round(2)
            df['ALICE_Percentage'] = (df['ALICE Households'] / df['Households'] * 100).round(2)
            df['Above_ALICE_Percentage'] = (df['Above ALICE Households'] / df['Households'] * 100).round(2)
            df['Below_ALICE_Threshold_Total'] = df['Poverty Households'] + df['ALICE Households']
            df['Below_ALICE_Threshold_Percentage'] = (df['Below_ALICE_Threshold_Total'] / df['Households'] * 100).round(2)
        
        # Add processing metadata
        df['Data_Source_File'] = state_name
        df['Processing_Date'] = pd.Timestamp.now().strftime('%Y-%m-%d')
        
        return df
    
    def create_summary_statistics(self):
        """Create summary statistics for the combined dataset"""
        summary_stats = {}
        
        if not self.master_county.empty:
            county_stats = {
                'total_counties': len(self.master_county),
                'total_states': self.master_county['State'].nunique(),
                'total_households_county': self.master_county['Households'].sum() if 'Households' in self.master_county.columns else 0,
                'avg_poverty_percentage': self.master_county['Poverty_Percentage'].mean() if 'Poverty_Percentage' in self.master_county.columns else 0,
                'avg_alice_percentage': self.master_county['ALICE_Percentage'].mean() if 'ALICE_Percentage' in self.master_county.columns else 0,
                'avg_below_alice_threshold': self.master_county['Below_ALICE_Threshold_Percentage'].mean() if 'Below_ALICE_Threshold_Percentage' in self.master_county.columns else 0
            }
            summary_stats['county'] = county_stats
        
        if not self.master_subcounty.empty:
            subcounty_stats = {
                'total_subcounty_areas': len(self.master_subcounty),
                'subcounty_types': self.master_subcounty['Type'].value_counts().to_dict() if 'Type' in self.master_subcounty.columns else {},
                'total_households_subcounty': self.master_subcounty['Households'].sum() if 'Households' in self.master_subcounty.columns else 0
            }
            summary_stats['subcounty'] = subcounty_stats
        
        summary_stats['processing'] = self.processing_stats
        
        return summary_stats
    
    def save_master_files(self):
        """Save consolidated data to multiple formats"""
        logger.info("Saving master files...")
        
        # Save County data
        if not self.master_county.empty:
            # Excel format
            county_excel_path = self.output_dir / "ALICE_Master_County_Data.xlsx"
            self.master_county.to_excel(county_excel_path, index=False, engine='openpyxl')
            logger.info(f"Saved county Excel: {county_excel_path}")
            
            # CSV format
            county_csv_path = self.output_dir / "ALICE_Master_County_Data.csv"
            self.master_county.to_csv(county_csv_path, index=False, encoding='utf-8')
            logger.info(f"Saved county CSV: {county_csv_path}")
        
        # Save Subcounty data  
        if not self.master_subcounty.empty:
            # Excel format
            subcounty_excel_path = self.output_dir / "ALICE_Master_Subcounty_Data.xlsx"
            self.master_subcounty.to_excel(subcounty_excel_path, index=False, engine='openpyxl')
            logger.info(f"Saved subcounty Excel: {subcounty_excel_path}")
            
            # CSV format
            subcounty_csv_path = self.output_dir / "ALICE_Master_Subcounty_Data.csv"
            self.master_subcounty.to_csv(subcounty_csv_path, index=False, encoding='utf-8')
            logger.info(f"Saved subcounty CSV: {subcounty_csv_path}")
        
        # Create combined file with multiple sheets
        combined_excel_path = self.output_dir / "ALICE_Master_Complete_Dataset.xlsx"
        with pd.ExcelWriter(combined_excel_path, engine='openpyxl') as writer:
            if not self.master_county.empty:
                self.master_county.to_excel(writer, sheet_name='County_Data', index=False)
            if not self.master_subcounty.empty:
                self.master_subcounty.to_excel(writer, sheet_name='Subcounty_Data', index=False)
            
            # Add summary statistics
            summary_stats = self.create_summary_statistics()
            summary_df = pd.DataFrame([summary_stats])
            summary_df.to_excel(writer, sheet_name='Summary_Stats', index=False)
        
        logger.info(f"Saved combined Excel: {combined_excel_path}")
        
        return {
            'county_excel': county_excel_path if not self.master_county.empty else None,
            'county_csv': county_csv_path if not self.master_county.empty else None,
            'subcounty_excel': subcounty_excel_path if not self.master_subcounty.empty else None,
            'subcounty_csv': subcounty_csv_path if not self.master_subcounty.empty else None,
            'combined_excel': combined_excel_path
        }
    
    def generate_report(self):
        """Generate a summary report of the consolidation process"""
        summary_stats = self.create_summary_statistics()
        
        report = f"""
ALICE Data Consolidation Report
===============================
Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}

Processing Summary:
- Files processed: {self.processing_stats['files_processed']}
- Files failed: {self.processing_stats['files_failed']}
- Failed files: {', '.join(self.processing_stats['failed_files']) if self.processing_stats['failed_files'] else 'None'}

County Data Summary:
- Total counties: {summary_stats.get('county', {}).get('total_counties', 0):,}
- States represented: {summary_stats.get('county', {}).get('total_states', 0)}
- Total households (county level): {summary_stats.get('county', {}).get('total_households_county', 0):,}
- Average poverty percentage: {summary_stats.get('county', {}).get('avg_poverty_percentage', 0):.2f}%
- Average ALICE percentage: {summary_stats.get('county', {}).get('avg_alice_percentage', 0):.2f}%
- Average below ALICE threshold: {summary_stats.get('county', {}).get('avg_below_alice_threshold', 0):.2f}%

Subcounty Data Summary:
- Total subcounty areas: {summary_stats.get('subcounty', {}).get('total_subcounty_areas', 0):,}
- Total households (subcounty level): {summary_stats.get('subcounty', {}).get('total_households_subcounty', 0):,}

Subcounty Types:
"""
        
        if 'subcounty' in summary_stats and 'subcounty_types' in summary_stats['subcounty']:
            for area_type, count in summary_stats['subcounty']['subcounty_types'].items():
                report += f"- {area_type}: {count:,}\n"
        
        # Save report
        report_path = self.output_dir / "ALICE_Consolidation_Report.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info(f"Generated report: {report_path}")
        return report

def main():
    """Main function to run the consolidation process"""
    logger.info("Starting ALICE data consolidation...")
    
    # Initialize consolidator
    consolidator = ALICEDataConsolidator()
    
    # Process all files
    consolidator.process_all_files()
    
    # Save master files
    output_files = consolidator.save_master_files()
    
    # Generate report
    report = consolidator.generate_report()
    
    # Print summary
    print("\n" + "="*50)
    print("ALICE DATA CONSOLIDATION COMPLETE")
    print("="*50)
    print(report)
    print("\nOutput Files Created:")
    for file_type, file_path in output_files.items():
        if file_path:
            print(f"- {file_type}: {file_path}")

if __name__ == "__main__":
    main()