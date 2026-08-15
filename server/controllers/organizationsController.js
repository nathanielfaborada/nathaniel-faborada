import { pool } from '../config/db.js';

/**
 * GET /api/organizations
 * Public: Retrieve all organizations
 */
export async function getAllOrganizations(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM organizations ORDER BY repos_count DESC, id ASC'
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve organizations.',
      error: error.message,
    });
  }
}

/**
 * POST /api/organizations
 * Protected (Admin only): Create new organization
 */
export async function createOrganization(req, res) {
  try {
    const {
      name,
      logo_url = null,
      visibility_type = 'Public',
      repos_count = 0,
      visit_url = null,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Organization name is required.',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO organizations (name, logo_url, visibility_type, repos_count, visit_url)
       VALUES (?, ?, ?, ?, ?)`,
      [name, logo_url, visibility_type, Number(repos_count) || 0, visit_url]
    );

    return res.status(201).json({
      success: true,
      message: 'Organization created successfully.',
      insertedId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create organization.',
      error: error.message,
    });
  }
}

/**
 * PUT /api/organizations/:id
 * Protected (Admin only): Update organization
 */
export async function updateOrganization(req, res) {
  try {
    const { id } = req.params;
    const { name, logo_url, visibility_type, repos_count, visit_url } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM organizations WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    await pool.execute(
      `UPDATE organizations SET
        name = COALESCE(?, name),
        logo_url = COALESCE(?, logo_url),
        visibility_type = COALESCE(?, visibility_type),
        repos_count = COALESCE(?, repos_count),
        visit_url = COALESCE(?, visit_url)
       WHERE id = ?`,
      [
        name,
        logo_url,
        visibility_type,
        repos_count !== undefined ? Number(repos_count) : null,
        visit_url,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Organization updated successfully.',
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update organization.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/organizations/:id
 * Protected (Admin only): Delete organization
 */
export async function deleteOrganization(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM organizations WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Organization deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete organization.',
      error: error.message,
    });
  }
}
