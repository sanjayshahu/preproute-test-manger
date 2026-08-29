import {
  getCurrentUser,
} from "../utils/auth";

import "./AppHeader.css";

interface AppHeaderProps {
  breadcrumb: string;
}

export default function AppHeader({
  breadcrumb,
}: AppHeaderProps) {
  const user = getCurrentUser();

  const userName =
    user?.name || user?.userId || "User";

  const userRole =
    user?.role
      ? user.role.charAt(0).toUpperCase() +
        user.role.slice(1)
      : "User";

  const avatarLetter =
    userName.charAt(0).toUpperCase();

  return (
    <header className="app-header">

      {/* =========================================
          BREADCRUMB
      ========================================== */}

      <div className="app-header-breadcrumb">
        {breadcrumb}
      </div>


      {/* =========================================
          PROFILE
      ========================================== */}

      <div className="app-header-profile">

        {/* Notification */}

        <button
          type="button"
          className="app-header-notification"
          aria-label="Notifications"
        >
          <img
            src="/assets/not.png"
            alt=""
            className="app-header-notification-icon"
          />
        </button>


        {/* User Avatar */}

        <div
          className="app-header-avatar"
          aria-hidden="true"
        >
          {avatarLetter}
        </div>


        {/* User Details */}

        <div className="app-header-profile-copy">

          <strong>
            {userName}
          </strong>

          <span>
            {userRole}
          </span>

        </div>


        {/* Profile Chevron */}

        <span
          className="app-header-chevron"
          aria-hidden="true"
        >
          ⌄
        </span>

      </div>

    </header>
  );
}