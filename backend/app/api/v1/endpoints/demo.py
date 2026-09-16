"""
FINBRIDGE — Demo Seeding Endpoint
POST /demo/seed
"""

import os
from datetime import datetime, timedelta
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.business import BusinessCreate
from app.services.business import BusinessService
from app.services.transaction import TransactionService
from app.models.business import Business

router = APIRouter(prefix="/demo", tags=["demo"])


@router.post("/seed", status_code=status.HTTP_200_OK)
async def seed_demo_data(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Seed the database with Shree Digital Solutions demo data for the current user."""
    biz_service = BusinessService(db)
    txn_service = TransactionService(db)
    
    # 1. Ensure clean slate (if user already had a business, we'll use it or update it)
    business = await biz_service.get_by_user_id(current_user.id)
    if not business:
        # Create Shree Digital Solutions
        business = await biz_service.create(
            user_id=current_user.id,
            data=BusinessCreate(
                business_name="Shree Digital Solutions",
                registration_number="27AADCS1494F1Z1",
                industry_type="Retail",
                years_in_operation=4,
                annual_turnover_range="10L - 50L"
            )
        )
    else:
        # Update existing to be Shree Digital Solutions just in case
        business.business_name = "Shree Digital Solutions"
        business.registration_number = "27AADCS1494F1Z1"
        business.industry_type = "Retail"
        business.years_in_operation = 4
        db.add(business)
        await db.commit()
        await db.refresh(business)

    # 2. Clear existing transactions for this business
    await db.execute(text("DELETE FROM transactions WHERE business_id = :biz_id"), {"biz_id": business.id})
    await db.commit()

    # 3. Generate 6 months of realistic transactions
    # We'll generate a CSV string and pass it to txn_service.upload_csv
    csv_lines = ["date,description,amount,type,merchant"]
    
    # End date is today
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=180)
    
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        
        # Daily Revenue (Retail)
        revenue_amount = round(random.uniform(5000, 15000), 2)
        csv_lines.append(f"{date_str},Daily Sales - UPI,{revenue_amount},credit,Razorpay")
        
        # Occasional Inventory Restock (every ~5 days)
        if random.random() < 0.2:
            inv_amount = round(random.uniform(20000, 45000), 2)
            csv_lines.append(f"{date_str},Wholesale Supplies,{inv_amount},debit,Delhivery B2B")
            
        # Monthly Rent (on 1st of month)
        if current_date.day == 1:
            csv_lines.append(f"{date_str},Store Rent,25000,debit,Property Owner")
            
        # Monthly Salaries (on 5th of month)
        if current_date.day == 5:
            csv_lines.append(f"{date_str},Staff Salary,35000,debit,Employee Payout")
            
        # Utilities (on 10th of month)
        if current_date.day == 10:
            csv_lines.append(f"{date_str},Electricity Bill,3500,debit,BESCOM")
            
        # Fraud injection (random high value transfers)
        if current_date.day == 15 and current_date.month % 3 == 0:
            # Velocity anomaly + unrecognized merchant
            csv_lines.append(f"{date_str},Suspicious Transfer 1,45000,debit,Unknown Crypto")
            csv_lines.append(f"{date_str},Suspicious Transfer 2,48000,debit,Unknown Crypto")
            
        current_date += timedelta(days=1)
        
    csv_content = "\n".join(csv_lines)
    
    # 4. Upload via service
    summary = await txn_service.upload_csv(
        business_id=business.id,
        file_bytes=csv_content.encode('utf-8'),
        filename="demo_seed.csv"
    )
    
    await db.commit()
    
    return {
        "success": True,
        "message": "Demo data seeded successfully.",
        "upload_summary": summary
    }
