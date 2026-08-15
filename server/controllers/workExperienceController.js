import { pool } from '../config/db.js';

/**
 * GET /api/work-experiences
 * Public: Fetch all work experiences ordered by start date
 */
export async function getAllWorkExperiences(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM work_experiences ORDER BY start_date DESC, id DESC'
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching work experiences:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve work experiences.',
      error: error.message,
    });
  }
}

/**
 * POST /api/work-experiences
 * Protected (Admin only): Create work experience
 */
export async function createWorkExperience(req, res) {
  try {
    const {
      company_name,
      company_logo_url = null,
      role_title,
      start_date,
      end_date = null,
      description = null,
      employment_type = 'Full-time',
    } = req.body;

    if (!company_name || !role_title || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Company name, role title, and start date are required.',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO work_experiences (
        company_name, company_logo_url, role_title,
        start_date, end_date, description, employment_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        company_logo_url,
        role_title,
        start_date,
        end_date,
        description,
        employment_type,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Work experience created successfully.',
      insertedId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create work experience.',
      error: error.message,
    });
  }
}

/**
 * PUT /api/work-experiences/:id
 * Protected (Admin only): Update work experience
 */
export async function updateWorkExperience(req, res) {
  try {
    const { id } = req.params;
    const {
      company_name,
      company_logo_url,
      role_title,
      start_date,
      end_date,
      description,
      employment_type,
    } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM work_experiences WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found.',
      });
    }

    await pool.execute(
      `UPDATE work_experiences SET
        company_name = COALESCE(?, company_name),
        company_logo_url = COALESCE(?, company_logo_url),
        role_title = COALESCE(?, role_title),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        description = COALESCE(?, description),
        employment_type = COALESCE(?, employment_type)
       WHERE id = ?`,
      [
        company_name,
        company_logo_url,
        role_title,
        start_date,
        end_date,
        description,
        employment_type,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Work experience updated successfully.',
    });
  } catch (error) {
    console.error('Error updating work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update work experience.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/work-experiences/:id
 * Protected (Admin only): Delete work experience
 */
export async function deleteWorkExperience(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM work_experiences WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Work experience not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Work experience deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting work experience:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete work experience.',
      error: error.message,
    });
  }
}
