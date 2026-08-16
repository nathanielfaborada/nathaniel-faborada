import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { api } from '../../services/api';
import './ItemFormModal.css';

export default function ItemFormModal({
  isOpen,
  type, // 'creation' | 'organization' | 'workExperience' | 'certificate'
  initialData = null,
  onClose,
  onSuccess,
}) {
  const isEdit = Boolean(initialData && initialData.id);
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddImage, setShowAddImage] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    setIsUploading(false);
    setShowAddImage(false);
    if (initialData) {
      const isCert =
        type === 'certificate' ||
        initialData.category === 'certificates' ||
        initialData.category === 'certificate' ||
        initialData.category === 'Certificate';
      const issuerName =
        initialData.issuer ||
        (initialData.notice && initialData.notice !== 'iframe' ? initialData.notice.replace(/^Issuer:\s*/i, '') : '') ||
        (Array.isArray(initialData.contributions) && initialData.contributions[0]
          ? initialData.contributions[0].replace(/^Issued by\s*/i, '')
          : '');

      const isIframe =
        initialData.source_code_url === 'iframe' ||
        initialData.notice === 'iframe' ||
        (Array.isArray(initialData.tags) && initialData.tags.includes('#iframe')) ||
        (typeof initialData.live_demo_url === 'string' &&
          (initialData.live_demo_url.includes('hackerrank.com') ||
            initialData.live_demo_url.includes('iframe') ||
            initialData.live_demo_url.includes('embed')));
      const displayMode = isIframe ? 'iframe' : (initialData.image_url ? 'image' : 'iframe');

      setFormData({
        ...initialData,
        title: initialData.title || initialData.headline || '',
        display_mode: displayMode,
        issuer: issuerName,
        credential_url:
          initialData.credential_url ||
          initialData.live_demo_url ||
          (initialData.links?.find((l) => l.type === 'visit' || l.type === 'credential')?.url) ||
          '',
        company_name: initialData.company_name || initialData.company || '',
        role_title:
          initialData.role_title ||
          initialData.title ||
          (initialData.roles && initialData.roles[0]?.title) ||
          '',
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        company_logo_url:
          initialData.company_logo_url || initialData.companyLogo || '',
        employment_type: initialData.employment_type || 'Full-time',
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.join(', ')
          : initialData.tags || '',
        contributions: Array.isArray(initialData.contributions)
          ? initialData.contributions.join('\n')
          : initialData.contributions || '',
        screenshots: Array.isArray(initialData.screenshots)
          ? initialData.screenshots.join('\n')
          : typeof initialData.screenshots === 'string'
          ? initialData.screenshots
          : '',
        project_date: initialData.project_date || '',
        image_url:
          initialData.image_url ||
          (Array.isArray(initialData.screenshots)
            ? initialData.screenshots[0]
            : initialData.screenshots) ||
          '',
        category: isCert ? 'Certificate' : initialData.category || 'personal',
        is_featured: Boolean(initialData.is_featured),
      });
    } else {
      // Defaults based on type
      if (type === 'creation') {
        setFormData({
          title: '',
          category: 'personal',
          project_date: '',
          description: '',
          notice: '',
          tags: '',
          contributions: '',
          source_code_url: '',
          live_demo_url: '',
          image_url: '',
          screenshots: '',
          is_featured: false,
          stars: '⭐',
        });
      } else if (type === 'certificate') {
        setFormData({
          title: '',
          display_mode: 'iframe',
          credential_url: '',
          image_url: '',
          issuer: '',
          description: '',
          project_date: '',
          is_featured: false,
        });
      } else if (type === 'organization') {
        setFormData({
          name: '',
          visibility_type: 'Public',
          repos_count: 0,
          logo_url: '',
          visit_url: '',
        });
      } else if (type === 'workExperience') {
        setFormData({
          company_name: '',
          role_title: '',
          start_date: '',
          end_date: '',
          employment_type: 'Full-time',
          description: '',
          company_logo_url: '',
        });
      }
    }
  }, [isOpen, type, initialData]);

  const handleChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: inputType === 'checkbox' ? checked : value,
    }));
  };

  // Derived creation images array
  const getCreationImages = () => {
    const list = [];
    if (formData.image_url && typeof formData.image_url === 'string' && formData.image_url.trim()) {
      list.push(formData.image_url.trim());
    }
    if (formData.screenshots) {
      let raw = [];
      if (Array.isArray(formData.screenshots)) {
        raw = formData.screenshots;
      } else if (typeof formData.screenshots === 'string') {
        try {
          const parsed = JSON.parse(formData.screenshots);
          if (Array.isArray(parsed)) raw = parsed;
          else raw = formData.screenshots.split('\n');
        } catch {
          raw = formData.screenshots.split('\n');
        }
      }
      raw.forEach((item) => {
        const trimmed = typeof item === 'string' ? item.trim() : '';
        if (trimmed && !list.includes(trimmed)) list.push(trimmed);
      });
    }
    return list;
  };

  const creationImages = getCreationImages();

  // Remove creation image at index
  const handleRemoveCreationImage = (idxToRemove) => {
    const updatedList = creationImages.filter((_, idx) => idx !== idxToRemove);
    setFormData((prev) => ({
      ...prev,
      image_url: updatedList[0] || '',
      screenshots: updatedList.slice(1).join('\n'),
    }));
  };

  // Cloudinary File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await api.upload.image(file);
      if (response.success && response.url) {
        if (type === 'creation') {
          const updatedList = [...creationImages, response.url];
          setFormData((prev) => ({
            ...prev,
            image_url: updatedList[0] || response.url,
            screenshots: updatedList.slice(1).join('\n'),
          }));
        } else if (type === 'organization') {
          setFormData((prev) => ({ ...prev, logo_url: response.url }));
        } else if (type === 'workExperience') {
          setFormData((prev) => ({ ...prev, company_logo_url: response.url }));
        }
        setShowAddImage(false);
        setTempUrl('');
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(err.message || 'Failed to upload image to Cloudinary.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove single image for organization / workExperience
  const handleRemoveSingleImage = () => {
    const imageField = type === 'organization' ? 'logo_url' : 'company_logo_url';
    setFormData((prev) => ({
      ...prev,
      [imageField]: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (type === 'creation') {
        const rawScreenshots = formData.screenshots
          ? Array.isArray(formData.screenshots)
            ? formData.screenshots
            : formData.screenshots
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
          : [];

        const primaryImage = formData.image_url?.trim() || null;
        if (primaryImage && !rawScreenshots.includes(primaryImage)) {
          rawScreenshots.unshift(primaryImage);
        }

        const payload = {
          ...formData,
          image_url: primaryImage || (rawScreenshots.length > 0 ? rawScreenshots[0] : null),
          screenshots: rawScreenshots,
          tags: formData.tags
            ? formData.tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          contributions: formData.contributions
            ? formData.contributions
                .split('\n')
                .map((c) => c.trim())
                .filter(Boolean)
            : [],
        };

        if (isEdit) {
          await api.creations.update(initialData.id, payload);
        } else {
          await api.creations.create(payload);
        }
      } else if (type === 'certificate') {
        const isIframe = formData.display_mode === 'iframe';
        const certImage = formData.image_url?.trim() || null;
        const issuerName = (formData.issuer || '').trim();
        const credUrl = (formData.credential_url || formData.live_demo_url || '').trim();

        if (!formData.title?.trim()) {
          throw new Error('Certificate Title is required.');
        }

        if (isIframe && !credUrl) {
          throw new Error('Iframe/Credential URL is required for Iframe mode.');
        }

        const certPayload = {
          title: formData.title.trim(),
          display_type: isIframe ? 'iframe' : 'image',
          credential_url: isIframe ? credUrl : (credUrl || null),
          image_url: isIframe ? null : certImage,
          issuer: issuerName || null,
        };

        if (isEdit) {
          if (initialData?.is_certificate_model) {
            await api.certificates.update(initialData.id, certPayload);
          } else {
            try {
              await api.certificates.update(initialData.id, certPayload);
            } catch {
              await api.creations.update(initialData.id, {
                title: formData.title.trim(),
                category: 'Certificate',
                description: issuerName ? `Issued by ${issuerName}.` : 'Certificate of Completion',
                live_demo_url: credUrl,
                image_url: certImage,
              });
            }
          }
          toast.success('Certificate updated! ✏️');
        } else {
          await api.certificates.create(certPayload);
          toast.success('Certificate added! 🎉');
        }

        onSuccess && onSuccess('certificate', isEdit ? 'updated' : 'added');
        onClose();
        return;
      } else if (type === 'organization') {
        const payload = {
          ...formData,
          repos_count: Number(formData.repos_count) || 0,
        };

        if (isEdit) {
          await api.organizations.update(initialData.id, payload);
        } else {
          await api.organizations.create(payload);
        }
      } else if (type === 'workExperience') {
        const payload = {
          company_name: (formData.company_name || formData.company || '').trim(),
          role_title: (formData.role_title || formData.title || '').trim(),
          start_date: formData.start_date || null,
          end_date: formData.end_date ? formData.end_date : null,
          description: (formData.description || '').trim() || null,
          employment_type: formData.employment_type || 'Full-time',
          company_logo_url: formData.company_logo_url || null,
        };

        if (!payload.company_name || !payload.role_title || !payload.start_date) {
          throw new Error('Company name, role title, and start date are required.');
        }

        if (isEdit) {
          await api.workExperiences.update(initialData.id, payload);
        } else {
          await api.workExperiences.create(payload);
        }
      }

      onSuccess && onSuccess(type, isEdit ? 'updated' : 'created');
      onClose();
    } catch (err) {
      console.error(`Error saving ${type}:`, err);
      const errMsg = err.data?.message || err.message || (type === 'certificate' ? 'Failed to save certificate. Please try again.' : 'Failed to save changes.');
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitle = () => {
    const action = isEdit ? 'Edit' : 'Add';
    if (type === 'creation') return `${action} Project Creation`;
    if (type === 'certificate') return `${action} Certificate`;
    if (type === 'organization') return `${action} Organization`;
    if (type === 'workExperience') return `${action} Work Experience`;
    return `${action} Item`;
  };

  const currentImageUrl =
    type === 'creation' || type === 'certificate'
      ? formData.image_url
      : type === 'organization'
      ? formData.logo_url
      : formData.company_logo_url;

  if (!isOpen) return null;

  return (
    <div
      className="item-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="item-modal-card">
        {/* Header */}
        <div className="item-modal-header">
          <h2 className="item-modal-title">{getTitle()}</h2>
          <button
            type="button"
            className="item-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} id="item-crud-form" className="item-modal-form">
          <div className="item-modal-body custom-scrollbar">
            {error && <div className="login-error-alert">{error}</div>}

            {/* CREATION FORM FIELDS */}
            {type === 'creation' && (
              <>
                <div className="item-form-group">
                  <label className="item-form-label">Project Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="item-form-input"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label">Category</label>
                    <select
                      name="category"
                      className="item-form-select"
                      value={formData.category || 'personal'}
                      onChange={handleChange}
                    >
                      <option value="personal">Personal Project</option>
                      <option value="organization">Organization</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label">Project Date / Timeline</label>
                    <input
                      type="text"
                      name="project_date"
                      className="item-form-input"
                      placeholder="e.g. Apr 2026"
                      value={formData.project_date || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Tech Tags (comma separated)</label>
                  <input
                    type="text"
                    name="tags"
                    className="item-form-input"
                    placeholder="React, Node.js, MySQL"
                    value={formData.tags || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Description</label>
                  <textarea
                    name="description"
                    className="item-form-textarea"
                    value={formData.description || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Key Contributions (one per line)</label>
                  <textarea
                    name="contributions"
                    className="item-form-textarea"
                    placeholder="• Built REST APIs...&#10;• Designed database schema..."
                    value={formData.contributions || ''}
                    onChange={handleChange}
                  />
                </div>

                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label">Source Code URL</label>
                    <input
                      type="url"
                      name="source_code_url"
                      className="item-form-input"
                      placeholder="https://github.com/..."
                      value={formData.source_code_url || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label">Live Demo URL</label>
                    <input
                      type="url"
                      name="live_demo_url"
                      className="item-form-input"
                      placeholder="https://..."
                      value={formData.live_demo_url || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Creation Images Gallery & Preview */}
                <div className="item-form-group image-upload-wrapper">
                  <label className="item-form-label">
                    Project Images & Gallery
                    {creationImages.length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: '#65676b', fontWeight: 400, marginLeft: '6px' }}>
                        ({creationImages.length} image{creationImages.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </label>

                  {/* Image Thumbnails Grid */}
                  {creationImages.length > 0 && (
                    <div className="image-thumbs-grid">
                      {creationImages.map((imgUrl, idx) => (
                        <div key={idx} className="image-thumb-card">
                          <img
                            src={imgUrl}
                            alt={`Preview ${idx + 1}`}
                            className="image-thumb-img w-full h-full object-cover"
                            loading="eager"
                            decoding="async"
                          />
                          <button
                            type="button"
                            className="image-thumb-delete-btn"
                            onClick={() => handleRemoveCreationImage(idx)}
                            title="Delete image"
                          >
                            ✕
                          </button>
                          {idx === 0 && (
                            <span className="image-thumb-badge">Primary</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Another Image Trigger Button */}
                  {creationImages.length > 0 && !showAddImage && (
                    <button
                      type="button"
                      className="add-image-toggle-btn"
                      onClick={() => setShowAddImage(true)}
                    >
                      + Add Another Image
                    </button>
                  )}

                  {/* Upload Box (Visible when empty or after clicking Add Another Image) */}
                  {(creationImages.length === 0 || showAddImage) && (
                    <div className="image-upload-box">
                      <div className="image-upload-dropzone">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="image-file-input"
                          accept="image/*"
                          onChange={handleFileUpload}
                          id="creation-image-file"
                        />
                        <button
                          type="button"
                          className="image-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          📁 {isUploading ? 'Uploading to Cloudinary...' : 'Upload Image to Cloudinary'}
                        </button>
                        <span className="image-upload-status">
                          {isUploading ? 'Please wait...' : 'PNG, JPG, WEBP up to 5MB'}
                        </span>
                      </div>
                      {creationImages.length > 0 && (
                        <button
                          type="button"
                          className="paste-url-cancel-btn"
                          style={{ alignSelf: 'flex-start' }}
                          onClick={() => setShowAddImage(false)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Notice / Access Info</label>
                  <input
                    type="text"
                    name="notice"
                    className="item-form-input"
                    placeholder="Email faboradanathaniel@gmail.com for access"
                    value={formData.notice || ''}
                    onChange={handleChange}
                  />
                </div>

                <label className="item-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={Boolean(formData.is_featured)}
                    onChange={handleChange}
                  />
                  Feature this project on top
                </label>
              </>
            )}

            {/* CERTIFICATE FORM FIELDS */}
            {type === 'certificate' && (
              <>
                {/* Field 1: Certificate Title */}
                <div className="item-form-group">
                  <label className="item-form-label" htmlFor="cert-title">
                    Certificate Title *
                  </label>
                  <input
                    id="cert-title"
                    type="text"
                    name="title"
                    className="item-form-input"
                    placeholder="e.g. Problem Solving (Basic)"
                    value={formData.title || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Field 2: Credential / Certificate URL */}
                <div className="item-form-group">
                  <label className="item-form-label" htmlFor="cert-cred-url">
                    Credential / Certificate URL
                  </label>
                  <input
                    id="cert-cred-url"
                    type="url"
                    name="credential_url"
                    className="item-form-input"
                    placeholder="e.g. https://www.hackerrank.com/certificates/... or https://coursera.org/verify/..."
                    value={formData.credential_url || formData.live_demo_url || ''}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData((prev) => ({
                        ...prev,
                        credential_url: e.target.value,
                        live_demo_url: e.target.value,
                      }));
                    }}
                  />
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#65676b', marginTop: '4px' }}>
                    💡 External links (e.g., HackerRank) will render as an external verification link button instead of an embedded frame.
                  </span>
                </div>

                {/* Field 3: Certificate Image URL or Upload */}
                <div className="item-form-group image-upload-wrapper">
                  <label className="item-form-label">Certificate Image or Badge (Optional)</label>

                  {formData.image_url ? (
                    <div className="image-thumbs-grid" style={{ gridTemplateColumns: '140px' }}>
                      <div className="image-thumb-card" style={{ aspectRatio: '4/3' }}>
                        <img
                          src={formData.image_url}
                          alt="Certificate preview"
                          className="image-thumb-img w-full h-full object-cover"
                          loading="eager"
                          decoding="async"
                        />
                        <button
                          type="button"
                          className="image-thumb-delete-btn"
                          onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="image-upload-box">
                      <div className="image-upload-dropzone">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="image-file-input"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setIsUploading(true);
                            setError(null);
                            try {
                              const response = await api.upload.image(file);
                              if (response.success && response.url) {
                                setFormData((prev) => ({ ...prev, image_url: response.url }));
                              }
                            } catch (err) {
                              setError(err.message || 'Failed to upload certificate image.');
                            } finally {
                              setIsUploading(false);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }
                          }}
                          id="cert-image-file"
                        />
                        <button
                          type="button"
                          className="image-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          📁 {isUploading ? 'Uploading...' : 'Upload Image to Cloudinary'}
                        </button>
                        <span className="image-upload-status">
                          {isUploading ? 'Uploading...' : 'Max 5MB'}
                        </span>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '8px' }}>
                    <input
                      type="url"
                      name="image_url"
                      className="item-form-input"
                      placeholder="Or paste direct image URL (https://...)"
                      value={formData.image_url || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Field 4: Issuer & Date */}
                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label" htmlFor="cert-issuer">
                      Issuer / Organization
                    </label>
                    <input
                      id="cert-issuer"
                      type="text"
                      name="issuer"
                      className="item-form-input"
                      placeholder="e.g. HackerRank, AWS, Coursera, Meta"
                      value={formData.issuer || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label" htmlFor="cert-date">
                      Issue Date / Timeline (Optional)
                    </label>
                    <input
                      id="cert-date"
                      type="text"
                      name="project_date"
                      className="item-form-input"
                      placeholder="e.g. Aug 2026 / 2025"
                      value={formData.project_date || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="item-form-group">
                  <label className="item-form-label" htmlFor="cert-desc">
                    Description / Key Skills (Optional)
                  </label>
                  <textarea
                    id="cert-desc"
                    name="description"
                    className="item-form-textarea"
                    rows={2}
                    placeholder="Brief description or verified skills..."
                    value={formData.description || ''}
                    onChange={handleChange}
                  />
                </div>

                <label className="item-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={Boolean(formData.is_featured)}
                    onChange={handleChange}
                  />
                  Feature this certificate on top
                </label>
              </>
            )}

            {/* ORGANIZATION FORM FIELDS */}
            {type === 'organization' && (
              <>
                <div className="item-form-group">
                  <label className="item-form-label">Organization Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="item-form-input"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label">Visibility</label>
                    <select
                      name="visibility_type"
                      className="item-form-select"
                      value={formData.visibility_type || 'Public'}
                      onChange={handleChange}
                    >
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label">Public Repositories Count</label>
                    <input
                      type="number"
                      name="repos_count"
                      className="item-form-input"
                      value={formData.repos_count ?? 0}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Organization Logo Upload & Preview */}
                <div className="item-form-group image-upload-wrapper">
                  <label className="item-form-label">Organization Logo</label>

                  {formData.logo_url ? (
                    <div className="image-thumbs-grid" style={{ gridTemplateColumns: '110px' }}>
                      <div className="image-thumb-card" style={{ aspectRatio: '1/1' }}>
                        <img
                          src={formData.logo_url}
                          alt="Logo preview"
                          className="image-thumb-img w-full h-full object-cover"
                          loading="eager"
                          decoding="async"
                        />
                        <button
                          type="button"
                          className="image-thumb-delete-btn"
                          onClick={handleRemoveSingleImage}
                          title="Delete logo"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="image-upload-box">
                      <div className="image-upload-dropzone">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="image-file-input"
                          accept="image/*"
                          onChange={handleFileUpload}
                          id="org-logo-file"
                        />
                        <button
                          type="button"
                          className="image-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          📁 {isUploading ? 'Uploading...' : 'Upload Logo to Cloudinary'}
                        </button>
                        <span className="image-upload-status">
                          {isUploading ? 'Uploading...' : 'Max 5MB'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Visit URL</label>
                  <input
                    type="url"
                    name="visit_url"
                    className="item-form-input"
                    placeholder="https://github.com/..."
                    value={formData.visit_url || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {/* WORK EXPERIENCE FORM FIELDS */}
            {type === 'workExperience' && (
              <>
                <div className="item-form-group">
                  <label className="item-form-label">Company Name *</label>
                  <input
                    type="text"
                    name="company_name"
                    className="item-form-input"
                    value={formData.company_name || ''}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label">Role Title *</label>
                    <input
                      type="text"
                      name="role_title"
                      className="item-form-input"
                      placeholder="e.g. Internship Developer"
                      value={formData.role_title || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label">Employment Type</label>
                    <select
                      name="employment_type"
                      className="item-form-select"
                      value={formData.employment_type || 'Full-time'}
                      onChange={handleChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>

                <div className="item-form-row">
                  <div className="item-form-group">
                    <label className="item-form-label">Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      className="item-form-input"
                      value={
                        formData.start_date
                          ? formData.start_date.substring(0, 10)
                          : ''
                      }
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="item-form-group">
                    <label className="item-form-label">End Date (Leave blank if Present)</label>
                    <input
                      type="date"
                      name="end_date"
                      className="item-form-input"
                      value={
                        formData.end_date
                          ? formData.end_date.substring(0, 10)
                          : ''
                      }
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Company Logo Upload & Preview */}
                <div className="item-form-group image-upload-wrapper">
                  <label className="item-form-label">Company Logo (Optional)</label>

                  {formData.company_logo_url ? (
                    <div className="image-thumbs-grid" style={{ gridTemplateColumns: '110px' }}>
                      <div className="image-thumb-card" style={{ aspectRatio: '1/1' }}>
                        <img
                          src={formData.company_logo_url}
                          alt="Company logo preview"
                          className="image-thumb-img w-full h-full object-cover"
                          loading="eager"
                          decoding="async"
                        />
                        <button
                          type="button"
                          className="image-thumb-delete-btn"
                          onClick={handleRemoveSingleImage}
                          title="Delete company logo"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="image-upload-box">
                      <div className="image-upload-dropzone">
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="image-file-input"
                          accept="image/*"
                          onChange={handleFileUpload}
                          id="company-logo-file"
                        />
                        <button
                          type="button"
                          className="image-upload-btn"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          📁 {isUploading ? 'Uploading...' : 'Upload Company Logo'}
                        </button>
                        <span className="image-upload-status">
                          {isUploading ? 'Uploading...' : 'Max 5MB'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="item-form-group">
                  <label className="item-form-label">Description</label>
                  <textarea
                    name="description"
                    className="item-form-textarea"
                    value={formData.description || ''}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="item-modal-footer flex flex-row items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              className="item-cancel-btn px-4 py-2 text-sm font-medium rounded-lg"
              onClick={onClose}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="item-save-btn px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : type === 'creation'
                ? 'Save Creation'
                : type === 'certificate'
                ? 'Add Certificate'
                : type === 'organization'
                ? 'Add Organization'
                : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
