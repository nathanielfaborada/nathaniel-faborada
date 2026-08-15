import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProfileHeader from './components/profile/ProfileHeader';
import ProfileNav from './components/profile/ProfileNav';
import Sidebar from './components/profile/Sidebar';
import ProjectsFeed from './components/projects/ProjectsFeed';
import CollaboratorsFullView from './components/collaborators/CollaboratorsFullView';
import AdminBar from './components/admin/AdminBar';
import LoginModal from './components/auth/LoginModal';
import ResetPasswordModal from './components/auth/ResetPasswordModal';
import ItemFormModal from './components/admin/ItemFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { useGithubUsers } from './hooks/useGithubUsers';
import { useGithubOrganizations } from './hooks/useGithubOrganizations';
import { useWindowSize } from './hooks/useWindowSize';
import { GITHUB_USERS, GITHUB_ORGANIZATIONS } from './data/collaboratorsData';
import { api } from './services/api';

function MainApp() {
  const [activeTab, setActiveTab] = useState('all');
  const { isMobile } = useWindowSize();
  const { isLoggedIn } = useAuth();

  // CRUD Modal & Refresh States
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [modalType, setModalType] = useState('creation'); // 'creation' | 'organization' | 'workExperience'
  const [editingItem, setEditingItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Delete Safeguard Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null,
    item: null,
    isDeleting: false,
  });

  // GitHub Collaborators & Organizations
  const {
    profileMap,
    isLoading: isUsersLoading,
  } = useGithubUsers(GITHUB_USERS);

  const {
    organizations,
    isLoading: isOrgsLoading,
  } = useGithubOrganizations(GITHUB_ORGANIZATIONS);

  const handleTabSelect = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeeAllCollaborators = () => {
    handleTabSelect('collaborators');
  };

  // Open Create Modal
  const handleOpenCreate = (type) => {
    setModalType(type);
    setEditingItem(null);
    setIsItemModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setIsItemModalOpen(true);
  };

  // Open Delete Safeguard Modal
  const handleRequestDelete = (type, item) => {
    setDeleteModal({
      isOpen: true,
      type,
      item,
      isDeleting: false,
    });
  };

  // Execute Confirmed Deletion
  const handleExecuteDelete = async (type, item) => {
    const title =
      item.title ||
      item.name ||
      item.company_name ||
      item.company ||
      item.role_title ||
      'Item';

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }));

    try {
      if (type === 'creation') {
        await api.creations.delete(item.id);
      } else if (type === 'organization') {
        await api.organizations.delete(item.id);
      } else if (type === 'workExperience') {
        await api.workExperiences.delete(item.id);
      }

      toast.success(`Deleted "${title}" successfully!`);
      setDeleteModal({ isOpen: false, type: null, item: null, isDeleting: false });
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.data?.message || err.message || 'Failed to delete item.');
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }));
    }
  };

  const handleModalSuccess = (type, action) => {
    const label =
      type === 'creation'
        ? 'Project'
        : type === 'organization'
        ? 'Organization'
        : 'Work Experience';
    toast.success(`${label} ${action} successfully!`);
    setRefreshTrigger((prev) => prev + 1);
  };

  // Determine layout visibility
  const isCollaboratorsView = activeTab === 'collaborators';
  const showSidebar = !isMobile || activeTab === 'about';
  const showFeed = !isMobile || activeTab === 'all';

  return (
    <>
      {/* Top Admin Control Bar */}
      <AdminBar />

      <div className="app-container">
        {/* Profile Header Banner & Info */}
        <ProfileHeader />

        {/* Sticky Navigation Tabs */}
        <ProfileNav activeTab={activeTab} onSelectTab={handleTabSelect} />

        {/* Default View: Two-Column Layout */}
        {!isCollaboratorsView && (
          <div id="view-default" className="page-layout">
            {/* Left Sidebar */}
            <Sidebar
              profileMap={profileMap}
              isCollaboratorsLoading={isUsersLoading}
              onSeeAllCollaborators={handleSeeAllCollaborators}
              refreshTrigger={refreshTrigger}
              onOpenCreateModal={handleOpenCreate}
              onEditExperience={(item) => handleOpenEdit('workExperience', item)}
              onDeleteExperience={(item) => handleRequestDelete('workExperience', item)}
              style={{
                display: showSidebar ? (isMobile ? 'flex' : '') : 'none',
              }}
            />

            {/* Right: Projects Feed */}
            {showFeed && (
              <ProjectsFeed
                refreshTrigger={refreshTrigger}
                onOpenCreateModal={handleOpenCreate}
                onEditProject={(item) => handleOpenEdit('creation', item)}
                onDeleteProject={(item) => handleRequestDelete('creation', item)}
              />
            )}
          </div>
        )}

        {/* Full Collaborators & Organizations View */}
        {isCollaboratorsView && (
          <CollaboratorsFullView
            profileMap={profileMap}
            isUsersLoading={isUsersLoading}
            organizations={organizations}
            isOrgsLoading={isOrgsLoading}
            onOpenCreateModal={handleOpenCreate}
            onEditOrganization={(item) => handleOpenEdit('organization', item)}
            onDeleteOrganization={(item) => handleRequestDelete('organization', item)}
          />
        )}
      </div>

      {/* Admin Sign-in Modal */}
      <LoginModal />

      {/* Item Creation & Edit Form Modal */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        type={modalType}
        initialData={editingItem}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Safeguard Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        type={deleteModal.type}
        item={deleteModal.item}
        isDeleting={deleteModal.isDeleting}
        onClose={() =>
          setDeleteModal({ isOpen: false, type: null, item: null, isDeleting: false })
        }
        onConfirm={handleExecuteDelete}
      />

      {/* Global Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/admin_nathaniel" element={<MainApp />} />
        <Route
          path="/reset-password"
          element={
            <>
              <MainApp />
              <ResetPasswordModal />
            </>
          }
        />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </AuthProvider>
  );
}
