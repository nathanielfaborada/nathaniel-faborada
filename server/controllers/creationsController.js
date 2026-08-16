import { pool } from '../config/db.js';

/**
 * GET /api/creations
 * Public: Fetch all projects/creations with optional category filter
 */
export async function getAllCreations(req, res) {
  try {
    const { category, featured } = req.query;

    let query = 'SELECT * FROM creations';
    const params = [];
    const conditions = [];

    if (category && category !== 'all') {
      const lowerCat = category.toLowerCase();
      if (lowerCat === 'certificate' || lowerCat === 'certificates') {
        conditions.push("(LOWER(category) = 'certificate' OR LOWER(category) = 'certificates')");
      } else {
        conditions.push('LOWER(category) = ?');
        params.push(lowerCat);
      }
    }

    if (featured === 'true') {
      conditions.push('is_featured = TRUE');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY is_featured DESC, id DESC';

    const [rows] = await pool.execute(query, params);

    // Format JSON fields if returned as string
    const formatted = rows.map((item) => ({
      ...item,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags || [],
      contributions:
        typeof item.contributions === 'string'
          ? JSON.parse(item.contributions)
          : item.contributions || [],
      screenshots:
        typeof item.screenshots === 'string'
          ? JSON.parse(item.screenshots)
          : item.screenshots || [],
      is_featured: Boolean(item.is_featured),
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching creations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve creations.',
      error: error.message,
    });
  }
}

/**
 * GET /api/creations/:id
 * Public: Fetch single project by ID
 */
export async function getCreationById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute('SELECT * FROM creations WHERE id = ? LIMIT 1', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Creation not found.',
      });
    }

    const item = rows[0];
    const formatted = {
      ...item,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags || [],
      contributions:
        typeof item.contributions === 'string'
          ? JSON.parse(item.contributions)
          : item.contributions || [],
      screenshots:
        typeof item.screenshots === 'string'
          ? JSON.parse(item.screenshots)
          : item.screenshots || [],
      is_featured: Boolean(item.is_featured),
    };

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error fetching creation by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve creation.',
      error: error.message,
    });
  }
}

/**
 * POST /api/creations
 * Protected (Admin only): Create a new creation entry
 */
export async function createCreation(req, res) {
  try {
    const {
      title,
      category = 'personal',
      project_date = null,
      description,
      notice = null,
      contributions = [],
      image_url = null,
      screenshots = [],
      source_code_url = null,
      live_demo_url = null,
      tags = [],
      is_featured = false,
      stars = null,
    } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO creations (
        title, category, project_date, description, notice, contributions,
        image_url, screenshots, source_code_url, live_demo_url,
        tags, is_featured, stars
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        category,
        project_date,
        description || '',
        notice,
        JSON.stringify(contributions),
        image_url,
        JSON.stringify(screenshots),
        source_code_url,
        live_demo_url,
        JSON.stringify(tags),
        is_featured ? 1 : 0,
        stars,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Creation created successfully.',
      insertedId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create creation entry.',
      error: error.message,
    });
  }
}

/**
 * PUT /api/creations/:id
 * Protected (Admin only): Update an existing creation
 */
export async function updateCreation(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      project_date,
      description,
      notice,
      contributions,
      image_url,
      screenshots,
      source_code_url,
      live_demo_url,
      tags,
      is_featured,
      stars,
    } = req.body;

    // Check if item exists
    const [existing] = await pool.execute(
      'SELECT id FROM creations WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Creation not found.',
      });
    }

    await pool.execute(
      `UPDATE creations SET
        title = COALESCE(?, title),
        category = COALESCE(?, category),
        project_date = COALESCE(?, project_date),
        description = COALESCE(?, description),
        notice = COALESCE(?, notice),
        contributions = COALESCE(?, contributions),
        image_url = COALESCE(?, image_url),
        screenshots = COALESCE(?, screenshots),
        source_code_url = COALESCE(?, source_code_url),
        live_demo_url = COALESCE(?, live_demo_url),
        tags = COALESCE(?, tags),
        is_featured = COALESCE(?, is_featured),
        stars = COALESCE(?, stars)
      WHERE id = ?`,
      [
        title,
        category,
        project_date,
        description,
        notice,
        contributions !== undefined ? JSON.stringify(contributions) : null,
        image_url,
        screenshots !== undefined ? JSON.stringify(screenshots) : null,
        source_code_url,
        live_demo_url,
        tags !== undefined ? JSON.stringify(tags) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        stars,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Creation updated successfully.',
    });
  } catch (error) {
    console.error('Error updating creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update creation entry.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/creations/:id
 * Protected (Admin only): Delete a creation
 */
export async function deleteCreation(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute('DELETE FROM creations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Creation not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Creation deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete creation entry.',
      error: error.message,
    });
  }
}
