import { pool } from '../config/db.js';

/**
 * GET /api/certificates
 * Public: Fetch all certificates ordered by created_at DESC
 */
export async function getAllCertificates(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM certificates ORDER BY created_at DESC, id DESC'
    );

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificates.',
      error: error.message,
    });
  }
}

/**
 * GET /api/certificates/:id
 * Public: Fetch single certificate by ID
 */
export async function getCertificateById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM certificates WHERE id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve certificate.',
      error: error.message,
    });
  }
}

/**
 * POST /api/certificates
 * Protected / Public API: Create new certificate entry
 */
export async function createCertificate(req, res) {
  try {
    const {
      title,
      display_type = 'iframe',
      credential_url = null,
      image_url = null,
      issuer = null,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    const cleanDisplayType = display_type === 'image' ? 'image' : 'iframe';

    const [result] = await pool.execute(
      `INSERT INTO certificates (
        title, display_type, credential_url, image_url, issuer
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        title.trim(),
        cleanDisplayType,
        credential_url ? credential_url.trim() : null,
        image_url ? image_url.trim() : null,
        issuer ? issuer.trim() : null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Certificate created successfully.',
      insertedId: result.insertId,
      data: {
        id: result.insertId,
        title: title.trim(),
        display_type: cleanDisplayType,
        credential_url,
        image_url,
        issuer,
      },
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create certificate.',
      error: error.message,
    });
  }
}

/**
 * PUT /api/certificates/:id
 * Protected / Public API: Update existing certificate
 */
export async function updateCertificate(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      display_type,
      credential_url,
      image_url,
      issuer,
    } = req.body;

    const [existing] = await pool.execute(
      'SELECT id FROM certificates WHERE id = ? LIMIT 1',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found.',
      });
    }

    const cleanDisplayType = display_type
      ? display_type === 'image' ? 'image' : 'iframe'
      : undefined;

    await pool.execute(
      `UPDATE certificates SET
        title = COALESCE(?, title),
        display_type = COALESCE(?, display_type),
        credential_url = ?,
        image_url = ?,
        issuer = ?
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : null,
        cleanDisplayType !== undefined ? cleanDisplayType : null,
        credential_url !== undefined ? (credential_url ? credential_url.trim() : null) : null,
        image_url !== undefined ? (image_url ? image_url.trim() : null) : null,
        issuer !== undefined ? (issuer ? issuer.trim() : null) : null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Certificate updated successfully.',
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update certificate.',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/certificates/:id
 * Protected / Public API: Delete certificate
 */
export async function deleteCertificate(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      'DELETE FROM certificates WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or already deleted.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Certificate deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete certificate.',
      error: error.message,
    });
  }
}
