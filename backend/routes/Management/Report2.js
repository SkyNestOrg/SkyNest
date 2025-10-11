import express from "express";
import db from "../../db.js";

const router = express.Router();

// Helper function to safely convert to number and format
function safeNumber(value, decimals = 2) {
    const num = Number(value) || 0;
    return parseFloat(num.toFixed(decimals));
}

// Helper function to calculate payment progress safely
function calculatePaymentProgress(paid, total) {
    const paidNum = Number(paid) || 0;
    const totalNum = Number(total) || 0;
    return totalNum > 0 ? safeNumber((paidNum / totalNum) * 100, 2) : 0;
}

// Get billing summary for checked-in guests (without guest details)
router.get("/billing-summary", async (req, res) => {
  try {
    const { branch_id } = req.query;

    let summaryData = {};

    if (!branch_id) {
      // Overall billing summary across all branches
      const [[totalPaid]] = await db.execute("SELECT GetTotalPaidForCheckedIn() as total_paid");
      const [[totalDue]] = await db.execute("SELECT GetTotalDueForCheckedIn() as total_due");
      const [[totalTax]] = await db.execute("SELECT GetTotalTaxPaidForCheckedIn() as total_tax");

      // Safely handle potential null values
      const totalPaidAmount = safeNumber(totalPaid.total_paid);
      const totalDueAmount = safeNumber(totalDue.total_due);
      const totalTaxAmount = safeNumber(totalTax.total_tax);
      const totalGrandTotal = safeNumber(totalPaidAmount + totalDueAmount);

      summaryData = {
        scope: "All Branches",
        summary: {
          totalGrandTotal: totalGrandTotal,
          totalPaid: totalPaidAmount,
          totalDue: totalDueAmount,
          totalTax: totalTaxAmount,
          paymentProgress: calculatePaymentProgress(totalPaidAmount, totalGrandTotal)
        },
        byBranch: []
      };

      // Get branch-wise breakdown
      const [branches] = await db.execute("SELECT branch_id, branch_name FROM branch");
      
      for (const branch of branches) {
        const [[branchPaid]] = await db.execute(
          "SELECT GetTotalPaidForCheckedInByBranch(?) as total_paid",
          [branch.branch_id]
        );
        const [[branchDue]] = await db.execute(
          "SELECT GetTotalDueForCheckedInByBranch(?) as total_due",
          [branch.branch_id]
        );
        const [[branchGrand]] = await db.execute(
          "SELECT GetTotalGrandTotalForCheckedInByBranch(?) as total_grand",
          [branch.branch_id]
        );
        const [[branchTax]] = await db.execute(
          "SELECT GetTotalTaxPaidForCheckedInByBranch(?) as total_tax",
          [branch.branch_id]
        );

        // Safely handle potential null values
        const branchTotalGrand = safeNumber(branchGrand.total_grand);
        const branchTotalPaid = safeNumber(branchPaid.total_paid);
        const branchTotalDue = safeNumber(branchDue.total_due);
        const branchTotalTax = safeNumber(branchTax.total_tax);

        summaryData.byBranch.push({
          branchId: branch.branch_id,
          branchName: branch.branch_name,
          totalGrandTotal: branchTotalGrand,
          totalPaid: branchTotalPaid,
          totalDue: branchTotalDue,
          totalTax: branchTotalTax,
          paymentProgress: calculatePaymentProgress(branchTotalPaid, branchTotalGrand)
        });
      }

    } else {
      // Specific branch billing summary
      const [[totalPaid]] = await db.execute(
        "SELECT GetTotalPaidForCheckedInByBranch(?) as total_paid",
        [branch_id]
      );
      const [[totalDue]] = await db.execute(
        "SELECT GetTotalDueForCheckedInByBranch(?) as total_due",
        [branch_id]
      );
      const [[totalGrand]] = await db.execute(
        "SELECT GetTotalGrandTotalForCheckedInByBranch(?) as total_grand",
        [branch_id]
      );
      const [[totalTax]] = await db.execute(
        "SELECT GetTotalTaxPaidForCheckedInByBranch(?) as total_tax",
        [branch_id]
      );

      // Get branch name
      const [branchRows] = await db.execute(
        "SELECT branch_name FROM branch WHERE branch_id = ?",
        [branch_id]
      );

      // Safely handle potential null values
      const totalGrandTotal = safeNumber(totalGrand.total_grand);
      const totalPaidAmount = safeNumber(totalPaid.total_paid);
      const totalDueAmount = safeNumber(totalDue.total_due);
      const totalTaxAmount = safeNumber(totalTax.total_tax);

      summaryData = {
        scope: branchRows[0]?.branch_name || `Branch ${branch_id}`,
        summary: {
          totalGrandTotal: totalGrandTotal,
          totalPaid: totalPaidAmount,
          totalDue: totalDueAmount,
          totalTax: totalTaxAmount,
          paymentProgress: calculatePaymentProgress(totalPaidAmount, totalGrandTotal)
        },
        byBranch: []
      };
    }

    res.json({
      success: true,
      data: summaryData
    });

  } catch (error) {
    console.error("Error generating billing summary:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// Get all branches for dropdown
router.get("/branches", async (req, res) => {
  try {
    const [branches] = await db.execute("SELECT branch_id, branch_name FROM branch ORDER BY branch_name");
    
    res.json({
      success: true,
      data: branches
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

export default router;