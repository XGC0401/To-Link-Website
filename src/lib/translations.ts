import type { Language } from "@/lib/types";

export type CopyKey =
  | "brand"
  | "tagline"
  | "auth.tagline"
  | "home.adminMessageContent"
  | "about.description"
  | "ai.senderName"
  | "auth.login"
  | "auth.register"
  | "auth.forgot"
  | "auth.reset"
  | "auth.remember"
  | "auth.demoNotice"
  | "auth.identifier"
  | "auth.passwordLabel"
  | "auth.firstName"
  | "auth.lastName"
  | "auth.usernameLabel"
  | "auth.emailLabel"
  | "auth.confirmPassword"
  | "auth.phoneLabel"
  | "auth.hkid"
  | "auth.countryLabel"
  | "auth.currentStateLabel"
  | "auth.jobTitleLabel"
  | "auth.registeredEmail"
  | "auth.newPassword"
  | "auth.confirmNewPassword"
  | "auth.verificationCode"
  | "auth.sendVerifyCode"
  | "auth.sending"
  | "auth.verifyCode"
  | "auth.verifying"
  | "auth.verifyEmailFirst"
  | "auth.emailVerifiedSuccess"
  | "auth.emailVerifiedReady"
  | "auth.emailCodeSentTo"
  | "auth.emailNotVerified"
  | "auth.verificationFailed"
  | "auth.emailCodeNotFound"
  | "auth.emailCodeExpired"
  | "auth.emailCodeAttemptsExceeded"
  | "auth.emailCodeIncorrect"
  | "auth.emailCodeDigits"
  | "auth.phoneVerified"
  | "auth.phoneNotVerified"
  | "auth.working"
  | "auth.atLeast6"
  | "auth.networkError"
  | "auth.tooManyRequests"
  | "auth.accountDisabled"
  | "auth.createPassword"
  | "auth.phoneFormat"
  | "auth.verifyPhoneFirst"
  | "auth.passwordMismatch"
  | "auth.enterForgotEmail"
  | "auth.invalidCredential"
  | "auth.invalidEmail"
  | "auth.state.worker"
  | "auth.state.employee"
  | "auth.state.jobless"
  | "auth.state.student"
  | "auth.hero.card1"
  | "auth.hero.card2"
  | "auth.hero.card3"
  | "auth.hero.cardDesc"
  | "auth.hero.card1Desc"
  | "auth.hero.card2Desc"
  | "auth.hero.card3Desc"
  | "auth.hero.headline"
  | "auth.error.enterIdentifier"
  | "auth.error.enterPassword"
  | "auth.error.notFound"
  | "auth.error.enterEmail"
  | "auth.error.verifyPhone"
  | "auth.error.weakPassword"
  | "auth.error.enterNewPassword"
  | "auth.error.invalidLink"
  | "auth.error.linkMismatch"
  | "auth.error.missingPassword"
  | "auth.error.userNotFound"
  | "auth.error.emailInUse"
  | "auth.error.missingEmail"
  | "auth.error.failed"
  | "nav.home"
  | "bestOfMonth.title"
  | "bestOfMonth.subtitle"
  | "bestOfMonth.viewAll"
  | "bestOfMonth.rank1"
  | "bestOfMonth.rank2"
  | "bestOfMonth.rank3"
  | "bestOfMonth.quests"
  | "bestOfMonth.activities"
  | "bestOfMonth.empty"
  | "nav.posts"
  | "nav.nearby"
  | "nav.connections"
  | "nav.activities"
  | "nav.building"
  | "nav.settings"
  | "nav.info"
  | "nav.signOut"
  | "nav.posts.all"
  | "nav.posts.sharing"
  | "nav.posts.secondHand"
  | "nav.posts.lostFound"
  | "nav.posts.quests"
  | "nav.nearby.shops"
  | "nav.nearby.communities"
  | "nav.connections.messages"
  | "nav.connections.friends"
  | "nav.activities.events"
  | "nav.activities.calendar"
  | "nav.activities.booking"
  | "nav.activities.bestOfMonth"
  | "nav.building.facilities"
  | "nav.building.ai"
  | "nav.building.documents"
  | "nav.settings.website"
  | "nav.settings.profile"
  | "nav.settings.userList"
  | "nav.info.feedback"
  | "nav.info.community"
  | "nav.info.faq"
  | "nav.info.help"
  | "nav.info.about"
  | "nav.info.privacy"
  | "nav.info.terms"
  | "nav.info.version"
  | "nav.info.data"
  | "data.title"
  | "data.subtitle"
  | "data.totalPosts"
  | "data.totalUsers"
  | "data.questsCompleted"
  | "data.totalLikes"
  | "data.totalComments"
  | "data.totalRewards"
  | "data.postsByCategory"
  | "data.sharing"
  | "data.secondHand"
  | "data.lostFound"
  | "data.quests"
  | "data.questBreakdown"
  | "data.questOpen"
  | "data.questAccepted"
  | "data.questCompleted"
  | "data.questFailed"
  | "data.engagementRate"
  | "data.avgLikesPerPost"
  | "data.avgCommentsPerPost"
  | "data.totalRewardsOffered"
  | "data.recentActivity"
  | "data.postsThisWeek"
  | "data.postsThisMonth"
  | "data.uniqueAuthors"
  | "data.activeQuests"
  | "control.fontSize"
  | "control.language"
  | "control.notifications"
  | "control.lightDark"
  | "weather.loading"
  | "weather.unavailable"
  | "weather.today"
  | "weather.wind"
  | "weather.rainfall"
  | "page.home"
  | "home.pageDesc"
  | "page.welcome"
  | "page.adminMessage"
  | "page.recentSharing"
  | "page.yourQuests"
  | "page.acceptedQuests"
  | "common.cancel"
  | "common.submit"
  | "common.save"
  | "common.edit"
  | "common.delete"
  | "common.yes"
  | "common.no"
  | "common.message"
  | "common.view"
  | "common.edited"
  | "common.viewMore"
  | "common.prev"
  | "common.next"
  | "common.latest"
  | "common.oldest"
  | "common.join"
  | "common.uploading"
  | "common.working"
  | "common.updated"
  | "common.bookNow"
  | "common.phone"
  | "common.website"
  | "common.locating"
  | "common.nearest"
  | "common.latestUpdate"
  | "common.contactNumbers"
  | "common.dateTime"
  | "common.dateTimePlaceholder"
  | "common.namePlaceholder"
  | "common.organizerName"
  | "common.participants"
  | "common.name"
  | "common.accept"
  | "common.deny"
  | "common.title"
  | "common.description"
  | "common.price"
  | "common.on"
  | "common.off"
  | "common.search"
  | "common.current"
  | "posts.pageTitle.all"
  | "posts.pageTitle.sharing"
  | "posts.pageTitle.secondHand"
  | "posts.pageTitle.lostFound"
  | "posts.pageTitle.quest"
  | "posts.selectedFiles"
  | "feedback.selectedFiles"
  | "auth.signedIn"
  | "auth.accountCreated"
  | "auth.resetSent"
  | "auth.emailNotRegistered"
  | "auth.passwordUpdated"
  | "auth.signedOut"
  | "auth.signOutError"
  | "toast.bookingSaved"
  | "toast.eventJoinSaved"
  | "toast.facilityBooked"
  | "toast.calendarEventCreated"
  | "toast.dailyLimitReached"
  | "toast.chatHistoryLimit"
  | "toast.bookingAccepted"
  | "toast.denyFlow"
  | "toast.cancelConfirm"
  | "toast.questApplied"
  | "toast.tradeIntent"
  | "toast.ownerChat"
  | "toast.clueForm"
  | "toast.feedbackSubmitted"
  | "toast.feedbackWithFiles"
  | "toast.messageSent"
  | "toast.itemDeleted"
  | "toast.itemUpdated"
  | "toast.openingChat"
  | "toast.bookingConversation"
  | "toast.reportBlock"
  | "toast.aiRenameFlow"
  | "notif.priorityInbox"
  | "home.manageAds"
  | "home.adminBroadcast"
  | "home.likes"
  | "home.comments"
  | "home.contactRequester"
  | "posts.search"
  | "posts.timeLimited"
  | "posts.cheapest"
  | "posts.mostExpensive"
  | "posts.highestReward"
  | "posts.lowestReward"
  | "posts.hideYourPosts"
  | "posts.showYourPosts"
  | "posts.foundIt"
  | "posts.toggleIncludingMine"
  | "posts.toggleExcludingMine"
  | "posts.createPost"
  | "posts.createQuest"
  | "posts.createSharing"
  | "posts.create2ndHand"
  | "posts.createLostFound"
  | "posts.acceptQuest"
  | "posts.trade"
  | "posts.get"
  | "posts.contactOwner"
  | "posts.clues"
  | "posts.tags"
  | "posts.tagsPlaceholder"
  | "posts.timeRange"
  | "posts.timeRangePlaceholder"
  | "posts.priceReward"
  | "posts.media"
  | "posts.editPost"
  | "posts.editQuest"
  | "posts.deletePost"
  | "posts.deleteQuest"
  | "posts.deleteConfirm"
  | "posts.deleteQuestConfirm"
  | "posts.created"
  | "posts.timeLimit"
  | "posts.questState"
  | "posts.reward"
  | "posts.price"
  | "messages.write"
  | "messages.search"
  | "messages.createGroup"
  | "messages.groupChat"
  | "messages.directMessage"
  | "messages.translate"
  | "messages.translating"
  | "messages.original"
  | "messages.attachMedia"
  | "messages.attachments"
  | "messages.messageDeleted"
  | "messages.edited"
  | "messages.editMessage"
  | "messages.deleteMessage"
  | "messages.renameRoom"
  | "messages.roomOptions"
  | "messages.deleteRoom"
  | "friends.search"
  | "friends.unfriend"
  | "friends.unfriendTitle"
  | "friends.unfriendConfirm"
  | "events.communityEvent"
  | "booking.participants"
  | "booking.denialReason"
  | "booking.cancelBooking"
  | "booking.status.accepted"
  | "booking.status.denied"
  | "booking.status.canceled"
  | "booking.status.pending"
  | "calendar.selectedDay"
  | "calendar.createEvent"
  | "calendar.noActivities"
  | "calendar.timePlaceholder"
  | "calendar.mon"
  | "calendar.tue"
  | "calendar.wed"
  | "calendar.thu"
  | "calendar.fri"
  | "calendar.sat"
  | "calendar.sun"
  | "facilities.details"
  | "facilities.pricingRule"
  | "facilities.pricePreview"
  | "facilities.frontDesk"
  | "facilities.availableSlots"
  | "facilities.participantsNumbers"
  | "facilities.roomName"
  | "facilities.bookingTitle"
  | "documents.search"
  | "documents.updated"
  | "ai.createNewChat"
  | "ai.remainingQuestions"
  | "ai.liveWebhook"
  | "ai.inputPlaceholder"
  | "ai.startConversation"
  | "nearby.searchShops"
  | "nearby.searchCommunities"
  | "nearby.nearbyShop"
  | "nearby.communityEvent"
  | "nearby.upcomingEvent"
  | "nearby.usage"
  | "nearby.usagePlaceholder"
  | "nearby.joinParticipants"
  | "nearby.extraInfo"
  | "nearby.bookTitle"
  | "nearby.joinTitle"
  | "nearby.participantsNumber"
  | "nearby.loadingLive"
  | "nearby.loadError"
  | "nearby.noResults"
  | "nearby.contactLimit"
  | "nearby.addContact"
  | "nearby.completeBooking"
  | "nearby.completeJoin"
  | "nearby.contactPhone"
  | "nearby.addParticipant"
  | "nearby.pendingConfirmation"
  | "nearby.youAreHere"
  | "nearby.date"
  | "nearby.startTime"
  | "nearby.endTime"
  | "posts.pageDesc"
  | "nearby.pageDesc"
  | "calendar.pageDesc"
  | "booking.pageDesc"
  | "events.pageDesc"
  | "messages.pageDesc"
  | "friends.pageDesc"
  | "ai.pageDesc"
  | "facilities.pageDesc"
  | "documents.pageDesc"
  | "profile.description"
  | "profile.username"
  | "profile.phone"
  | "profile.loginEmail"
  | "profile.currentState"
  | "profile.country"
  | "profile.jobTitle"
  | "profile.bio"
  | "profile.availableTimeSlot"
  | "profile.history"
  | "profile.deletedAt"
  | "profile.statusSecurity"
  | "profile.onlineStatus"
  | "profile.personalId"
  | "profile.password"
  | "profile.maskedId"
  | "profile.changePassword"
  | "settings.description"
  | "settings.appearance"
  | "settings.notificationPref"
  | "settings.languageRegion"
  | "settings.privacySecurity"
  | "settings.displayMode"
  | "settings.displayModeDesc"
  | "settings.fontScale"
  | "settings.languageTitle"
  | "settings.languageDesc"
  | "settings.currentLight"
  | "settings.currentDark"
  | "settings.currentEn"
  | "settings.currentZh"
  | "settings.notif.messages"
  | "settings.notif.likes"
  | "settings.notif.friends"
  | "settings.notif.quests"
  | "settings.notif.bookings"
  | "settings.notif.critical"
  | "settings.notif.optional"
  | "settings.privacy.blockList"
  | "settings.privacy.password"
  | "settings.privacy.maskedId"
  | "settings.privacy.alerts"
  | "settings.privacy.desc"
  | "feedback.placeholder"
  | "feedback.upload"
  | "feedback.fileTypes"
  | "feedback.submit"
  | "feedback.uploading"
  | "about.platformNote";

const copy: Record<Language, Record<CopyKey, string>> = {
  en: {
    brand: "To-Link",
    tagline: "Neighborhood life, connected with care.",
    "auth.tagline": "Stronger neighborhoods through community posts, shared help, local events, and building services.",
    "home.adminMessageContent": "Fire drill notice: The building-wide drill will take place on 24 Jun 2026 at 10:00. Please use the stairs, avoid the lifts, and gather at the podium assembly point after evacuation.",
    "about.description": "To-Link is designed as a refined neighborhood operating system: one place for residents to share resources, request help, coordinate activities, book facilities, discover nearby services, and maintain stronger local trust through clear, respectful interaction design.",
    "ai.senderName": "To-Link AI",
    "auth.login": "Sign in",
    "auth.register": "Create account",
    "auth.forgot": "Forgot or change password",
    "auth.reset": "Reset password",
    "auth.remember": "Remember me",
    "auth.demoNotice": "",
    "auth.identifier": "Email / Username / Phone",
    "auth.passwordLabel": "Password",
    "auth.firstName": "First Name",
    "auth.lastName": "Last Name",
    "auth.usernameLabel": "Username",
    "auth.emailLabel": "Email",
    "auth.confirmPassword": "Confirm Password",
    "auth.phoneLabel": "Phone Number",
    "auth.hkid": "HKID / Personal ID",
    "auth.countryLabel": "Country",
    "auth.currentStateLabel": "Current State",
    "auth.jobTitleLabel": "Job Title",
    "auth.registeredEmail": "Registered Email",
    "auth.newPassword": "New Password",
    "auth.confirmNewPassword": "Confirm New Password",
    "auth.verificationCode": "Verification Code",
    "auth.sendVerifyCode": "Send Verify Code",
    "auth.sending": "Sending...",
    "auth.verifyCode": "Verify Code",
    "auth.verifying": "Verifying...",
    "auth.verifyEmailFirst": "Please verify your email with the code first.",
    "auth.emailVerifiedSuccess": "Email verified successfully.",
    "auth.emailVerifiedReady": "Email verified. You can now create your account.",
    "auth.emailCodeSentTo": "Code sent to {email}.",
    "auth.emailNotVerified": "Verify email to continue.",
    "auth.verificationFailed": "Verification failed.",
    "auth.emailCodeNotFound": "No verification code found. Please send a new code.",
    "auth.emailCodeExpired": "Verification code has expired. Please send a new code.",
    "auth.emailCodeAttemptsExceeded": "Too many incorrect attempts. Please send a new code.",
    "auth.emailCodeIncorrect": "Incorrect verification code.",
    "auth.emailCodeDigits": "Verification code must be 6 digits.",
    "auth.phoneVerified": "Phone verified. You can now create your account.",
    "auth.phoneNotVerified": "Phone not verified yet.",
    "auth.working": "Working...",
    "auth.atLeast6": "At least 6 chars",
    "auth.networkError": "Network error while contacting Firebase Auth.",
    "auth.tooManyRequests": "Too many attempts. Please wait a moment and try again.",
    "auth.accountDisabled": "This account has been disabled.",
    "auth.createPassword": "Create a password to register your account.",
    "auth.phoneFormat": "Use a valid international phone number format, for example +85291234567.",
    "auth.verifyPhoneFirst": "Please verify your phone number before creating an account.",
    "auth.passwordMismatch": "Password confirmation does not match.",
    "auth.enterForgotEmail": "Enter the email address for your account.",
    "auth.invalidCredential": "Incorrect email or password.",
    "auth.invalidEmail": "Enter a valid email address.",
    "auth.state.worker": "Worker",
    "auth.state.employee": "Employee",
    "auth.state.jobless": "Jobless",
    "auth.state.student": "Student",
    "auth.hero.card1": "Community updates",
    "auth.hero.card2": "Quest collaboration",
    "auth.hero.card3": "Building services",
    "auth.hero.cardDesc": "Designed to stay elegant, fast, and modular as the platform grows.",
    "auth.hero.card1Desc": "Stay informed with the latest building announcements, community news, and local events in real time.",
    "auth.hero.card2Desc": "Collaborate with neighbours on quests, lost-and-found items, and shared errands to build a helping community.",
    "auth.hero.card3Desc": "Book facilities, browse building documents, and access AI-assisted support for everyday living.",
    "auth.hero.headline": "An elevated neighborhood hub where residents connect, collaborate, and get things done.",
    "auth.error.enterIdentifier": "Enter your email, username, or phone number to sign in.",
    "auth.error.enterPassword": "Enter your password to sign in.",
    "auth.error.notFound": "No account was found for that email, username, or phone number.",
    "auth.error.enterEmail": "Enter your email address to create an account.",
    "auth.error.verifyPhone": "Enter your phone number and verify it before creating an account.",
    "auth.error.weakPassword": "Password must be at least 6 characters long.",
    "auth.error.enterNewPassword": "Enter your new password.",
    "auth.error.invalidLink": "Invalid or expired reset link. Please request a new one.",
    "auth.error.linkMismatch": "This reset link does not match the entered email address.",
    "auth.error.missingPassword": "Enter your password to continue.",
    "auth.error.userNotFound": "No account exists for that email address.",
    "auth.error.emailInUse": "An account already exists for that email address.",
    "auth.error.missingEmail": "Enter your email address to continue.",
    "auth.error.failed": "Authentication failed.",
    "nav.home": "Home",
    "bestOfMonth.title": "Best of the Month",
    "bestOfMonth.subtitle": "Top residents this month by quests completed and community participation.",
    "bestOfMonth.viewAll": "View Leaderboard",
    "bestOfMonth.rank1": "1st Place",
    "bestOfMonth.rank2": "2nd Place",
    "bestOfMonth.rank3": "3rd Place",
    "bestOfMonth.quests": "quests",
    "bestOfMonth.activities": "activities",
    "bestOfMonth.empty": "No leaderboard data yet.",
    "nav.posts": "Posts",
    "nav.nearby": "Nearby",
    "nav.connections": "Connections",
    "nav.activities": "Activities",
    "nav.building": "Building",
    "nav.settings": "Settings",
    "nav.info": "Info",
    "nav.signOut": "Sign Out",
    "nav.posts.all": "All",
    "nav.posts.sharing": "Sharing",
    "nav.posts.secondHand": "2nd Hand",
    "nav.posts.lostFound": "Lost & Find",
    "nav.posts.quests": "Quests",
    "nav.nearby.shops": "Nearby Shops",
    "nav.nearby.communities": "Nearby Communities",
    "nav.connections.messages": "Messages",
    "nav.connections.friends": "Friends",
    "nav.activities.events": "Events",
    "nav.activities.calendar": "Calendar",
    "nav.activities.booking": "Booking Status",
    "nav.activities.bestOfMonth": "Best of the Month",
    "nav.building.facilities": "Facilities",
    "nav.building.ai": "AI Chat",
    "nav.building.documents": "Documents",
    "nav.settings.website": "Website Settings",
    "nav.settings.profile": "Profile Settings",
    "nav.settings.userList": "User List",
    "nav.info.feedback": "App Feedback",
    "nav.info.community": "Community Feedback",
    "nav.info.faq": "FAQ",
    "nav.info.help": "Help Center",
    "nav.info.about": "About Us",
    "nav.info.privacy": "Privacy Policy",
    "nav.info.terms": "Terms of Service",
    "nav.info.version": "Version v1.0.0",
    "nav.info.data": "Data & Insights",
    "data.title": "Data & Insights",
    "data.subtitle": "Platform engagement overview for stakeholders",
    "data.totalPosts": "Total Posts",
    "data.totalUsers": "Registered Users",
    "data.questsCompleted": "Quests Completed",
    "data.totalLikes": "Total Likes",
    "data.totalComments": "Total Comments",
    "data.totalRewards": "Total Rewards (HKD)",
    "data.postsByCategory": "Posts by Category",
    "data.sharing": "Sharing",
    "data.secondHand": "Second-hand",
    "data.lostFound": "Lost & Found",
    "data.quests": "Quests",
    "data.questBreakdown": "Quest Completion Breakdown",
    "data.questOpen": "Open",
    "data.questAccepted": "In Progress",
    "data.questCompleted": "Completed",
    "data.questFailed": "Failed / Overdue",
    "data.engagementRate": "Engagement",
    "data.avgLikesPerPost": "Avg. Likes per Post",
    "data.avgCommentsPerPost": "Avg. Comments per Post",
    "data.totalRewardsOffered": "Total Rewards Offered",
    "data.recentActivity": "Recent Activity",
    "data.postsThisWeek": "Posts this week",
    "data.postsThisMonth": "Posts this month",
    "data.uniqueAuthors": "Unique Authors",
    "data.activeQuests": "Active Quests",
    "control.fontSize": "Font Size",
    "control.language": "Language",
    "control.notifications": "Notifications",
    "control.lightDark": "Light / Dark",
    "weather.loading": "Loading live weather",
    "weather.unavailable": "Weather unavailable",
    "weather.today": "Today Weather",
    "weather.wind": "Wind",
    "weather.rainfall": "Rain",
    "page.home": "Home overview",
    "home.pageDesc": "Live weather, notices, community highlights, and quick actions are gathered here for an at-a-glance daily overview.",
    "page.welcome": "Welcome back",
    "page.adminMessage": "Admin message",
    "page.recentSharing": "Recent Sharing",
    "page.yourQuests": "Your Quests",
    "page.acceptedQuests": "Accepted Quest",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.yes": "Yes",
    "common.no": "No",
    "common.message": "Message",
    "common.view": "View",
    "common.edited": "edited",
    "common.viewMore": "View More",
    "common.prev": "Prev",
    "common.next": "Next",
    "common.latest": "Latest",
    "common.oldest": "Oldest",
    "common.join": "Join",
    "common.uploading": "Uploading...",
    "common.working": "Working...",
    "common.updated": "Updated:",
    "common.bookNow": "Book Now!",
    "common.phone": "Phone",
    "common.website": "Website",
    "common.locating": "Locating...",
    "common.nearest": "Nearest",
    "common.latestUpdate": "Latest Update",
    "common.contactNumbers": "Contact Number(s)",
    "common.dateTime": "Date & Time",
    "common.dateTimePlaceholder": "25 Jun 2026 13:00 to 15:00",
    "common.namePlaceholder": "Dai Long Wong",
    "common.organizerName": "Organizer Name",
    "common.participants": "Participants",
    "common.name": "Name",
    "common.accept": "Accept",
    "common.deny": "Deny",
    "common.title": "Title",
    "common.description": "Description",
    "common.price": "Price",
    "common.on": "On",
    "common.off": "Off",
    "common.search": "Search",
    "common.current": "Current:",
    "posts.pageTitle.all": "Posts",
    "posts.pageTitle.sharing": "Sharing",
    "posts.pageTitle.secondHand": "2nd Hand",
    "posts.pageTitle.lostFound": "Lost & Find",
    "posts.pageTitle.quest": "Quest Board",
    "posts.selectedFiles": "Selected {n} media file(s) for Cloudinary upload.",
    "feedback.selectedFiles": "Selected {n} attachment(s) for Cloudinary upload.",
    "auth.signedIn": "Signed in successfully.",
    "auth.accountCreated": "Account created successfully.",
    "auth.resetSent": "Password reset email sent.",
    "auth.emailNotRegistered": "This email is not registered.",
    "auth.passwordUpdated": "Password updated successfully. Please sign in again.",
    "auth.signedOut": "Signed out.",
    "auth.signOutError": "Could not sign out right now.",
    "toast.bookingSaved": "Booking saved and ready for calendar sync.",
    "toast.eventJoinSaved": "Community event join request saved to your calendar feed.",
    "toast.facilityBooked": "Facility booking request prepared and ready for calendar sync.",
    "toast.calendarEventCreated": "Personal event created in the calendar interface.",
    "toast.dailyLimitReached": "Daily AI question limit reached for this demo session.",
    "toast.chatHistoryLimit": "Chat history limit reached. Delete an older chat first.",
    "toast.bookingAccepted": "Booking accepted in the owner review flow.",
    "toast.denyFlow": "Deny flow prepared with required reason field.",
    "toast.cancelConfirm": "Cancel confirmation prepared for requester flow.",
    "toast.questApplied": "Quest application special message sent to requester chat.",
    "toast.tradeIntent": "Trade intent message sent to the seller.",
    "toast.ownerChat": "Owner chat opened in the Connections area.",
    "toast.clueForm": "Clue form prepared in the detail view.",
    "toast.feedbackSubmitted": "Thank you. Your feedback has been submitted.",
    "toast.feedbackWithFiles": "Thank you. Your feedback and {n} attachment(s) have been submitted.",
    "toast.messageSent": "Message sent.",
    "toast.itemDeleted": "Item moved to history in Profile Settings.",
    "toast.itemUpdated": "Post updated.",
    "toast.openingChat": "Opening chat with {name}.",
    "toast.bookingConversation": "Booking conversation opened in Messages.",
    "toast.reportBlock": "Report and block actions are ready for admin wiring.",
    "toast.aiRenameFlow": "Rename flow prepared for future AI thread management.",
    "notif.priorityInbox": "Priority inbox",
    "home.manageAds": "Manage ads",
    "home.adminBroadcast": "Broadcasts and operational reminders from building management.",
    "home.likes": "likes",
    "home.comments": "comments",
    "home.contactRequester": "Contact requester",
    "posts.search": "Search title, description, tags, or time",
    "posts.timeLimited": "Time Limited",
    "posts.cheapest": "Cheapest",
    "posts.mostExpensive": "Most Expensive",
    "posts.highestReward": "Highest Reward",
    "posts.lowestReward": "Least Reward",
    "posts.hideYourPosts": "Current: Show Your Posts",
    "posts.showYourPosts": "Current: Hide Your Posts",
    "posts.foundIt": "Found It!",
    "posts.toggleIncludingMine": "Showing all users posts including myself",
    "posts.toggleExcludingMine": "Showing all users posts excluding myself",
    "posts.createPost": "Create Post",
    "posts.createQuest": "Create Quest",
    "posts.createSharing": "Create Sharing Post",
    "posts.create2ndHand": "Create 2nd Hand Post",
    "posts.createLostFound": "Create Lost & Find Post",
    "posts.acceptQuest": "Accept Quest",
    "posts.trade": "Trade",
    "posts.get": "Get",
    "posts.contactOwner": "Contact Owner",
    "posts.clues": "Clues",
    "posts.tags": "Tags",
    "posts.tagsPlaceholder": "comma or space separated tags",
    "posts.timeRange": "Time range",
    "posts.timeRangePlaceholder": "Today 13:00 to 20:00",
    "posts.priceReward": "Price / Reward",
    "posts.media": "Media",
    "posts.editPost": "Edit post",
    "posts.editQuest": "Edit quest",
    "posts.deletePost": "Delete post",
    "posts.deleteQuest": "Delete quest",
    "posts.deleteConfirm": "Are you sure you want to delete this post?",
    "posts.deleteQuestConfirm": "Are you sure you want to delete this quest?",
    "posts.created": "Created:",
    "posts.timeLimit": "Time limit:",
    "posts.questState": "Quest state:",
    "posts.reward": "Reward:",
    "posts.price": "Price:",
    "messages.write": "Write a message",
    "messages.search": "Search chat room or user",
    "messages.createGroup": "Create Group Chat",
    "messages.groupChat": "Group chat",
    "messages.directMessage": "Direct message",
    "messages.translate": "Translate",
    "messages.translating": "Translating...",
    "messages.original": "Original",
    "messages.attachMedia": "Attach media or documents",
    "messages.attachments": "Attachments ({n})",
    "messages.messageDeleted": "Message Deleted",
    "messages.edited": "(edited)",
    "messages.editMessage": "Edit",
    "messages.deleteMessage": "Delete",
    "messages.renameRoom": "Rename",
    "messages.roomOptions": "Chat room options",
    "messages.deleteRoom": "Delete room",
    "friends.search": "Search usernames",
    "friends.unfriend": "Unfriend",
    "friends.unfriendTitle": "Unfriend resident",
    "friends.unfriendConfirm": "Are you sure you want to unfriend this person?",
    "events.communityEvent": "Community Event",
    "booking.participants": "Participants:",
    "booking.denialReason": "Denial reason:",
    "booking.cancelBooking": "Cancel Booking",
    "booking.status.accepted": "accepted",
    "booking.status.denied": "denied",
    "booking.status.canceled": "canceled",
    "booking.status.pending": "pending",
    "calendar.selectedDay": "Selected day",
    "calendar.createEvent": "Create Event",
    "calendar.noActivities": "No activities on this day yet.",
    "calendar.timePlaceholder": "Time",
    "calendar.mon": "Mon",
    "calendar.tue": "Tue",
    "calendar.wed": "Wed",
    "calendar.thu": "Thu",
    "calendar.fri": "Fri",
    "calendar.sat": "Sat",
    "calendar.sun": "Sun",
    "facilities.details": "Facility details",
    "facilities.pricingRule": "Pricing rule",
    "facilities.pricePreview": "Price preview",
    "facilities.frontDesk": "*Please pay at the front desk*",
    "facilities.availableSlots": "Available time slots",
    "facilities.participantsNumbers": "Participants Numbers",
    "facilities.roomName": "Room Name",
    "facilities.bookingTitle": "Facility booking",
    "documents.search": "Search documents",
    "documents.updated": "Updated:",
    "ai.createNewChat": "Create New Chat",
    "ai.remainingQuestions": "Remaining AI questions today:",
    "ai.liveWebhook": "Live via n8n webhook",
    "ai.inputPlaceholder": "Ask about regulations, meetings, facilities, or building contacts",
    "ai.startConversation": "Start a new building-related conversation. Messages sent here will be forwarded through the configured n8n assistant workflow.",
    "nearby.searchShops": "Search shops or restaurants",
    "nearby.searchCommunities": "Search communities",
    "nearby.nearbyShop": "Nearby shop",
    "nearby.communityEvent": "Community event",
    "nearby.upcomingEvent": "Upcoming event",
    "nearby.usage": "Usage",
    "nearby.usagePlaceholder": "Birthday Party",
    "nearby.joinParticipants": "Number of participants",
    "nearby.extraInfo": "Extra Information",
    "nearby.bookTitle": "Book nearby place",
    "nearby.joinTitle": "Join community event",
    "nearby.participantsNumber": "Participants Number",
    "nearby.loadingLive": "Loading live nearby places...",
    "nearby.loadError": "Could not load live nearby places right now.",
    "nearby.noResults": "No live nearby places matched your search.",
    "nearby.contactLimit": "You can add up to 3 contact numbers.",
    "nearby.addContact": "Add contact number",
    "nearby.completeBooking": "Please complete all booking fields before submitting.",
    "nearby.completeJoin": "Please complete the join request before submitting.",
    "nearby.contactPhone": "Contact Phone Number",
    "nearby.addParticipant": "Add participant",
    "nearby.pendingConfirmation": "Pending confirmation",
    "nearby.youAreHere": "You are here",
    "nearby.date": "Date",
    "nearby.startTime": "Start Time",
    "nearby.endTime": "End Time",
    "posts.pageDesc": "Search, sort, and manage community content with route-specific actions and moderation controls.",
    "nearby.pageDesc": "Use browser geolocation to discover places nearby, then switch between a list-detail workspace and a live map view.",
    "calendar.pageDesc": "Bookings, joined events, and personal plans stay on one calendar with a day-detail panel and quick event creation.",
    "booking.pageDesc": "Track requests across shops, facilities, and other reservable spaces with explicit pending, accepted, denied, and canceled states.",
    "events.pageDesc": "Community-hosted events can be discovered here and joined with participant details that feed into the calendar system.",
    "messages.pageDesc": "A direct-message and group-chat workspace styled for ongoing conversations, special system messages, and cross-feature navigation.",
    "friends.pageDesc": "Search suggested neighbors, manage friendships, and jump directly into private conversations.",
    "ai.pageDesc": "The AI assistant sends building questions through the configured n8n webhook, while keeping local chat history management and the daily-limit UI.",
    "facilities.pageDesc": "Clubhouse rooms and facilities use a split workspace with availability, booking logic, and front-desk payment guidance.",
    "documents.pageDesc": "Building regulations, policies, and operational notices are organized here for quick search and lightweight review.",
    "profile.description": "Registration data feeds directly into profile settings so residents can manage identity, contact details, availability, and history from one place.",
    "profile.username": "Username",
    "profile.phone": "Phone Number",
    "profile.loginEmail": "Login Email",
    "profile.currentState": "Current State",
    "profile.country": "Country",
    "profile.jobTitle": "Job Title",
    "profile.bio": "Bio",
    "profile.availableTimeSlot": "Available time slot",
    "profile.history": "History",
    "profile.deletedAt": "Deleted at",
    "profile.statusSecurity": "Status & Security",
    "profile.onlineStatus": "Online status",
    "profile.personalId": "Personal ID display",
    "profile.password": "Password",
    "profile.maskedId": "Masked and stored server-side",
    "profile.changePassword": "Change via secure reset flow",
    "settings.description": "Website-wide preferences are centralized here, with appearance, notification, language, and privacy controls separated into focused tabs.",
    "settings.appearance": "Appearance",
    "settings.notificationPref": "Notification Preference",
    "settings.languageRegion": "Language & Region",
    "settings.privacySecurity": "Privacy & Security",
    "settings.displayMode": "Display mode",
    "settings.displayModeDesc": "Switch between light and dark mode for the full interface.",
    "settings.fontScale": "Font scale",
    "settings.languageTitle": "Language",
    "settings.languageDesc": "Toggle instantly between English and Traditional Chinese.",
    "settings.currentLight": "Current: Light",
    "settings.currentDark": "Current: Dark",
    "settings.currentEn": "Current: English",
    "settings.currentZh": "Current: 中文",
    "settings.notif.messages": "Messages",
    "settings.notif.likes": "Likes and Comments",
    "settings.notif.friends": "Friend Requests",
    "settings.notif.quests": "Quest Reminders",
    "settings.notif.bookings": "Booking Updates",
    "settings.notif.critical": "Critical or enabled by default.",
    "settings.notif.optional": "Optional notification.",
    "settings.privacy.blockList": "Block List management",
    "settings.privacy.password": "Password and email security",
    "settings.privacy.maskedId": "Masked personal ID display",
    "settings.privacy.alerts": "Critical alert preferences",
    "settings.privacy.desc": "This module is prepared for Firebase-backed profile persistence and admin-safe audit trails.",
    "feedback.placeholder": "Share your thoughts, concerns, or suggestions here.",
    "feedback.upload": "Upload up to 5 images or videos",
    "feedback.fileTypes": "JPG, PNG, WEBP, or MP4",
    "feedback.submit": "Submit feedback",
    "feedback.uploading": "Uploading...",
    "about.platformNote": "The platform is structured to keep social, operational, and building-specific tools modular, so feature updates can evolve safely without destabilizing unrelated areas.",
  },
  "zh-HK": {
    brand: "鄰到里",
    tagline: "連結鄰里生活，細緻而可靠。",
    "auth.tagline": "透過社區帖子、互助請求、本地活動及大廈服務，建立更緊密的鄰里關係。",
    "home.adminMessageContent": "消防演習通知：全棟將於 2026年6月24日 10:00 進行消防演習。請使用樓梯、避免使用升降機，並於疏散後到平台集合點集合。",
    "about.description": "鄰到里是一個精緻的鄰里生活平台：讓居民在同一地方分享資源、請求協助、協調活動、預約設施、探索附近服務，並透過清晰友善的互動設計建立更強的社區信任。",
    "ai.senderName": "鄰到里 AI",
    "auth.login": "登入",
    "auth.register": "建立帳戶",
    "auth.forgot": "忘記或更改密碼",
    "auth.reset": "重設密碼",
    "auth.remember": "記住我",
    "auth.demoNotice": "",
    "auth.identifier": "電郵 / 用戶名 / 電話",
    "auth.passwordLabel": "密碼",
    "auth.firstName": "名字",
    "auth.lastName": "姓氏",
    "auth.usernameLabel": "用戶名",
    "auth.emailLabel": "電郵",
    "auth.confirmPassword": "確認密碼",
    "auth.phoneLabel": "電話號碼",
    "auth.hkid": "香港身份證 / 個人證件",
    "auth.countryLabel": "國家",
    "auth.currentStateLabel": "目前狀態",
    "auth.jobTitleLabel": "職位",
    "auth.registeredEmail": "已登記電郵",
    "auth.newPassword": "新密碼",
    "auth.confirmNewPassword": "確認新密碼",
    "auth.verificationCode": "驗證碼",
    "auth.sendVerifyCode": "發送驗證碼",
    "auth.sending": "發送中...",
    "auth.verifyCode": "驗證",
    "auth.verifying": "驗證中...",
    "auth.verifyEmailFirst": "請先使用驗證碼完成電郵驗證。",
    "auth.emailVerifiedSuccess": "電郵驗證成功。",
    "auth.emailVerifiedReady": "電郵已驗證，你現在可以建立帳戶。",
    "auth.emailCodeSentTo": "驗證碼已發送至 {email}。",
    "auth.emailNotVerified": "請先驗證電郵以繼續。",
    "auth.verificationFailed": "驗證失敗。",
    "auth.emailCodeNotFound": "找不到驗證碼，請重新發送新驗證碼。",
    "auth.emailCodeExpired": "驗證碼已過期，請重新發送新驗證碼。",
    "auth.emailCodeAttemptsExceeded": "錯誤次數過多，請重新發送新驗證碼。",
    "auth.emailCodeIncorrect": "驗證碼不正確。",
    "auth.emailCodeDigits": "驗證碼必須為 6 位數字。",
    "auth.phoneVerified": "電話號碼已驗證，您現可創建帳戶。",
    "auth.phoneNotVerified": "電話號碼尚未驗證。",
    "auth.working": "處理中...",
    "auth.atLeast6": "最少 6 個字元",
    "auth.networkError": "網絡錯誤，無法連線 Firebase。",
    "auth.tooManyRequests": "嘗試次數過多，請稍候再試。",
    "auth.accountDisabled": "此帳號已被停用。",
    "auth.createPassword": "請建立密碼以完成註冊。",
    "auth.phoneFormat": "請使用有效的國際電話號碼格式，例如 +85291234567。",
    "auth.verifyPhoneFirst": "請先驗證電話號碼再建立帳號。",
    "auth.passwordMismatch": "密碼確認不符。",
    "auth.enterForgotEmail": "請輸入帳號的電郵地址。",
    "auth.invalidCredential": "電郵或密碼错誤。",
    "auth.invalidEmail": "請輸入有效的電郵地址。",
    "auth.state.worker": "工人",
    "auth.state.employee": "受僱人員",
    "auth.state.jobless": "待業",
    "auth.state.student": "學生",
    "auth.hero.card1": "社區動態",
    "auth.hero.card2": "任務協作",
    "auth.hero.card3": "大廈服務",
    "auth.hero.cardDesc": "設計優雅、快速，隨平台成長保持模組化。",
    "auth.hero.card1Desc": "即時掌握最新大廈公告、社區資訊及本地活動動態。",
    "auth.hero.card2Desc": "與鄰居合作完成任務、尋找失物及互助跑腿，共建助人社區。",
    "auth.hero.card3Desc": "預約設施、瀏覽大廈文件，並使用 AI 助理獲取日常生活支援。",
    "auth.hero.headline": "以社區為核心，讓居民連結、協作、高效辦事的鄰里平台。",
    "auth.error.enterIdentifier": "請輸入電郵、用戶名或電話號碼以登入。",
    "auth.error.enterPassword": "請輸入密碼以登入。",
    "auth.error.notFound": "找不到該電郵、用戶名或電話號碼的帳號。",
    "auth.error.enterEmail": "請輸入電郵地址以建立帳號。",
    "auth.error.verifyPhone": "請輸入並驗證電話號碼後再建立帳號。",
    "auth.error.weakPassword": "密碼必須至少 6 個字元。",
    "auth.error.enterNewPassword": "請輸入新密碼。",
    "auth.error.invalidLink": "重設連結無效或已過期，請重新申請。",
    "auth.error.linkMismatch": "此重設連結與所輸入的電郵地址不符。",
    "auth.error.missingPassword": "請輸入密碼以繼續。",
    "auth.error.userNotFound": "該電郵地址並無對應帳號。",
    "auth.error.emailInUse": "該電郵地址已被使用。",
    "auth.error.missingEmail": "請輸入電郵地址以繼續。",
    "auth.error.failed": "認證失敗。",
    "nav.home": "主頁",
    "bestOfMonth.title": "本月之星",
    "bestOfMonth.subtitle": "本月完成任務及社區參與最多的住戶。",
    "bestOfMonth.viewAll": "查看排行榜",
    "bestOfMonth.rank1": "第一名",
    "bestOfMonth.rank2": "第二名",
    "bestOfMonth.rank3": "第三名",
    "bestOfMonth.quests": "任務",
    "bestOfMonth.activities": "活動",
    "bestOfMonth.empty": "暫無排行榜資料。",
    "nav.posts": "帖子",
    "nav.nearby": "附近",
    "nav.connections": "連結",
    "nav.activities": "活動",
    "nav.building": "大廈",
    "nav.settings": "設定",
    "nav.info": "資訊",
    "nav.signOut": "登出",
    "nav.posts.all": "全部",
    "nav.posts.sharing": "分享",
    "nav.posts.secondHand": "二手",
    "nav.posts.lostFound": "失物尋回",
    "nav.posts.quests": "任務",
    "nav.nearby.shops": "附近商店",
    "nav.nearby.communities": "附近社區",
    "nav.connections.messages": "訊息",
    "nav.connections.friends": "朋友",
    "nav.activities.events": "活動",
    "nav.activities.calendar": "日曆",
    "nav.activities.booking": "預約狀態",
    "nav.activities.bestOfMonth": "本月之星",
    "nav.building.facilities": "會所設施",
    "nav.building.ai": "AI 對話",
    "nav.building.documents": "文件",
    "nav.settings.website": "網站設定",
    "nav.settings.profile": "個人設定",
    "nav.settings.userList": "用戶列表",
    "nav.info.feedback": "應用程式回饋",
    "nav.info.community": "社區回饋",
    "nav.info.faq": "常見問題",
    "nav.info.help": "幫助中心",
    "nav.info.about": "關於我們",
    "nav.info.privacy": "私隱政策",
    "nav.info.terms": "服務條款",
    "nav.info.version": "版本 v1.0.0",
    "nav.info.data": "數據與分析",
    "data.title": "數據與分析",
    "data.subtitle": "平台參與數據概覽（供持份者參考）",
    "data.totalPosts": "帖子總數",
    "data.totalUsers": "注冊用戶",
    "data.questsCompleted": "已完成任務",
    "data.totalLikes": "總點讚數",
    "data.totalComments": "總留言數",
    "data.totalRewards": "總獎勵（港幣）",
    "data.postsByCategory": "按類別統計帖子",
    "data.sharing": "共享",
    "data.secondHand": "二手市場",
    "data.lostFound": "失物招領",
    "data.quests": "任務",
    "data.questBreakdown": "任務完成情況",
    "data.questOpen": "待接受",
    "data.questAccepted": "進行中",
    "data.questCompleted": "已完成",
    "data.questFailed": "失敗 / 逾期",
    "data.engagementRate": "互動統計",
    "data.avgLikesPerPost": "每帖平均點讚",
    "data.avgCommentsPerPost": "每帖平均留言",
    "data.totalRewardsOffered": "提供的總獎勵",
    "data.recentActivity": "近期活動",
    "data.postsThisWeek": "本週帖子",
    "data.postsThisMonth": "本月帖子",
    "data.uniqueAuthors": "獨立作者",
    "data.activeQuests": "活躍任務",
    "control.fontSize": "字體大小",
    "control.language": "語言",
    "control.notifications": "通知",
    "control.lightDark": "明亮 / 深色",
    "weather.loading": "正在載入即時天氣",
    "weather.unavailable": "未能取得天氣資料",
    "weather.today": "今日天氣",
    "weather.wind": "風速",
    "weather.rainfall": "雨量",
    "page.home": "主頁總覽",
    "home.pageDesc": "即時天氣、管理通知、社區重點與快捷操作都集中在這裡，方便你快速掌握每日狀況。",
    "page.welcome": "歡迎回來",
    "page.adminMessage": "管理員訊息",
    "page.recentSharing": "最近分享",
    "page.yourQuests": "你的任務",
    "page.acceptedQuests": "已接受任務",
    "common.cancel": "取消",
    "common.submit": "提交",
    "common.save": "儲存",
    "common.edit": "編輯",
    "common.delete": "刪除",
    "common.yes": "是",
    "common.no": "否",
    "common.message": "訊息",
    "common.view": "查看",
    "common.edited": "已編輯",
    "common.viewMore": "查看更多",
    "common.prev": "上一個",
    "common.next": "下一個",
    "common.latest": "最新",
    "common.oldest": "最舊",
    "common.join": "加入",
    "common.uploading": "上傳中...",
    "common.working": "處理中...",
    "common.updated": "更新：",
    "common.bookNow": "立即預約！",
    "common.phone": "電話",
    "common.website": "網站",
    "common.locating": "定位中...",
    "common.nearest": "最近",
    "common.latestUpdate": "最新更新",
    "common.contactNumbers": "聯絡電話",
    "common.dateTime": "日期及時間",
    "common.dateTimePlaceholder": "2026年6月25日 13:00 至 15:00",
    "common.namePlaceholder": "李小明",
    "common.organizerName": "主辦人姓名",
    "common.participants": "參與人數",
    "common.name": "姓名",
    "common.accept": "接受",
    "common.deny": "拒絕",
    "common.title": "標題",
    "common.description": "描述",
    "common.price": "費用",
    "common.on": "開啟",
    "common.off": "關閉",
    "common.search": "搜尋",
    "common.current": "目前：",
    "posts.pageTitle.all": "帖子",
    "posts.pageTitle.sharing": "分享",
    "posts.pageTitle.secondHand": "二手",
    "posts.pageTitle.lostFound": "失物尋回",
    "posts.pageTitle.quest": "任務廣場",
    "posts.selectedFiles": "已選擇 {n} 個媒體檔案待上傳。",
    "feedback.selectedFiles": "已選擇 {n} 個附件待上傳。",
    "auth.signedIn": "登入成功。",
    "auth.accountCreated": "帳號建立成功。",
    "auth.resetSent": "密碼重設電郵已發送。",
    "auth.emailNotRegistered": "此電郵地址尚未註冊。",
    "auth.passwordUpdated": "密碼已更新，請重新登入。",
    "auth.signedOut": "已登出。",
    "auth.signOutError": "登出失敗，請稍候再試。",
    "toast.bookingSaved": "預約已儲存，將同步至日曆。",
    "toast.eventJoinSaved": "社區活動加入請求已儲存至日曆。",
    "toast.facilityBooked": "設施預約請求已準備，將同步至日曆。",
    "toast.calendarEventCreated": "個人活動已創建在日曆。",
    "toast.dailyLimitReached": "今日 AI 問題限額已用盡。",
    "toast.chatHistoryLimit": "聆天記錄已達上限，請刪除舊記錄再新建。",
    "toast.bookingAccepted": "預約已接受。",
    "toast.denyFlow": "拒絕流程已準備，需填寫拒絕原因。",
    "toast.cancelConfirm": "取消確認已準備。",
    "toast.questApplied": "任務申請訊息已發送至請求者聆天。",
    "toast.tradeIntent": "交易意向訊息已發送至賣家。",
    "toast.ownerChat": "已在「連結」開啟物主聆天。",
    "toast.clueForm": "線索表單已在詳情頁準備。",
    "toast.feedbackSubmitted": "感謝您的意見，已成功提交。",
    "toast.feedbackWithFiles": "感謝。您的意見及 {n} 個附件已提交。",
    "toast.messageSent": "訊息已發送。",
    "toast.itemDeleted": "項目已移至個人設定的歷史記錄。",
    "toast.itemUpdated": "帖子已更新。",
    "toast.openingChat": "正在開啟聆天：{name}。",
    "toast.bookingConversation": "預約對話已在「訊息」開啟。",
    "toast.reportBlock": "舉報及封鎖功能將由管理員處理。",
    "toast.aiRenameFlow": "重命名流程已準備。",
    "notif.priorityInbox": "優先收件箱",
    "home.manageAds": "管理廣告",
    "home.adminBroadcast": "來自大廈管理處的廣播及營運提示。",
    "home.likes": "個讚好",
    "home.comments": "條留言",
    "home.contactRequester": "聯絡請求者",
    "posts.search": "搜尋標題、描述、標籤或時間",
    "posts.timeLimited": "限時",
    "posts.cheapest": "最便宜",
    "posts.mostExpensive": "最貴",
    "posts.highestReward": "最高賞金",
    "posts.lowestReward": "最低賞金",
    "posts.hideYourPosts": "目前：顯示你的帖子",
    "posts.showYourPosts": "目前：隱藏你的帖子",
    "posts.foundIt": "我找到了！",
    "posts.toggleIncludingMine": "顯示所有用戶帖子，包括自己",
    "posts.toggleExcludingMine": "顯示所有用戶帖子，不包括自己",
    "posts.createPost": "發布帖子",
    "posts.createQuest": "發布任務",
    "posts.createSharing": "發布分享帖子",
    "posts.create2ndHand": "發布二手帖子",
    "posts.createLostFound": "發布失物尋回帖子",
    "posts.acceptQuest": "接受任務",
    "posts.trade": "交換",
    "posts.get": "領取",
    "posts.contactOwner": "聯絡物主",
    "posts.clues": "線索",
    "posts.tags": "標籤",
    "posts.tagsPlaceholder": "以逗號或空格分隔標籤",
    "posts.timeRange": "時間範圍",
    "posts.timeRangePlaceholder": "今日 13:00 至 20:00",
    "posts.priceReward": "價格 / 賞金",
    "posts.media": "媒體",
    "posts.editPost": "編輯帖子",
    "posts.editQuest": "編輯任務",
    "posts.deletePost": "刪除帖子",
    "posts.deleteQuest": "刪除任務",
    "posts.deleteConfirm": "確定要刪除這個帖子嗎？",
    "posts.deleteQuestConfirm": "確定要刪除這個任務嗎？",
    "posts.created": "建立於：",
    "posts.timeLimit": "限時：",
    "posts.questState": "任務狀態：",
    "posts.reward": "獎勵：",
    "posts.price": "價格：",
    "messages.write": "輸入訊息",
    "messages.search": "搜尋聊天室或用戶",
    "messages.createGroup": "建立群組聊天",
    "messages.groupChat": "群組聊天",
    "messages.directMessage": "私訊",
    "messages.translate": "翻譯",
    "messages.translating": "翻譯中...",
    "messages.original": "原文",
    "messages.attachMedia": "附加媒體或文件",
    "messages.attachments": "附件 ({n})",
    "messages.messageDeleted": "已刪除訊息",
    "messages.edited": "（已編輯）",
    "messages.editMessage": "編輯",
    "messages.deleteMessage": "刪除",
    "messages.renameRoom": "更改名稱",
    "messages.roomOptions": "聊天室選項",
    "messages.deleteRoom": "刪除對話",
    "friends.search": "搜尋用戶名",
    "friends.unfriend": "取消好友",
    "friends.unfriendTitle": "取消好友關係",
    "friends.unfriendConfirm": "確定要取消此人的好友關係嗎？",
    "events.communityEvent": "社區活動",
    "booking.participants": "參與人數：",
    "booking.denialReason": "拒絕原因：",
    "booking.cancelBooking": "取消預約",
    "booking.status.accepted": "已接受",
    "booking.status.denied": "已拒絕",
    "booking.status.canceled": "已取消",
    "booking.status.pending": "待審核",
    "calendar.selectedDay": "已選日期",
    "calendar.createEvent": "建立活動",
    "calendar.noActivities": "這天暫無活動。",
    "calendar.timePlaceholder": "時間",
    "calendar.mon": "一",
    "calendar.tue": "二",
    "calendar.wed": "三",
    "calendar.thu": "四",
    "calendar.fri": "五",
    "calendar.sat": "六",
    "calendar.sun": "日",
    "facilities.details": "設施詳情",
    "facilities.pricingRule": "收費規則",
    "facilities.pricePreview": "預算費用",
    "facilities.frontDesk": "*請於前台付款*",
    "facilities.availableSlots": "可用時段",
    "facilities.participantsNumbers": "參與人數",
    "facilities.roomName": "房間名稱",
    "facilities.bookingTitle": "設施預約",
    "documents.search": "搜尋文件",
    "documents.updated": "更新：",
    "ai.createNewChat": "建立新對話",
    "ai.remainingQuestions": "今日剩餘 AI 提問次數：",
    "ai.liveWebhook": "透過 n8n Webhook 即時連線",
    "ai.inputPlaceholder": "查詢規例、會議、設施或大廈聯絡資料",
    "ai.startConversation": "開始新的大廈相關對話，訊息將透過已設定的 n8n 助理工作流程轉發。",
    "nearby.searchShops": "搜尋商店或餐廳",
    "nearby.searchCommunities": "搜尋社區",
    "nearby.nearbyShop": "附近商店",
    "nearby.communityEvent": "社區活動",
    "nearby.upcomingEvent": "即將舉行的活動",
    "nearby.usage": "用途",
    "nearby.usagePlaceholder": "生日派對",
    "nearby.joinParticipants": "參與人數",
    "nearby.extraInfo": "額外資料",
    "nearby.bookTitle": "預約附近地點",
    "nearby.joinTitle": "加入社區活動",
    "nearby.participantsNumber": "參與人數",
    "nearby.loadingLive": "正在載入附近的即時地點資料...",
    "nearby.loadError": "目前未能載入附近的即時地點資料。",
    "nearby.noResults": "附近沒有符合搜尋條件的即時地點。",
    "nearby.contactLimit": "最多只可加入 3 個聯絡電話。",
    "nearby.addContact": "加入聯絡電話",
    "nearby.completeBooking": "請先填妥所有預約資料再提交。",
    "nearby.completeJoin": "請先填妥加入申請再提交。",
    "nearby.contactPhone": "聯絡電話",
    "nearby.addParticipant": "加入參與者",
    "nearby.pendingConfirmation": "待確認",
    "nearby.youAreHere": "你的位置",
    "nearby.date": "日期",
    "nearby.startTime": "開始時間",
    "nearby.endTime": "結束時間",
    "posts.pageDesc": "搜尋、排序及管理社區內容，支援各路由的特定操作及管理功能。",
    "nearby.pageDesc": "使用瀏覽器地理位置發現附近地點，切換列表詳情模式與地圖模式。",
    "calendar.pageDesc": "預約、已加入活動及個人行程均顯示於同一日曆，支援日曆詳情面板及快速建立活動。",
    "booking.pageDesc": "追蹤商行、設施及其他可預約空間的請求，包含待處理、已接受、已拒絕及已取消狀態。",
    "events.pageDesc": "在此探索及加入社區活動，參與資料將同步至日曆系統。",
    "messages.pageDesc": "支援持續對話、特殊系統訊息及跨功能導航的直接訊息與群組聊天工作區。",
    "friends.pageDesc": "搜尋建議住戶、管理好友關係，並直接開始私人對話。",
    "ai.pageDesc": "AI 助手透過已配置的 n8n webhook 處理大廈相關問題，並保留本地聊天記錄管理及每日限額介面。",
    "facilities.pageDesc": "會所設施頁集中顯示可用時段、預約邏輯及前台付款指引。",
    "documents.pageDesc": "大廈法規、政策及營運公告集中整理於此，支援快速搜尋及輕量查閱。",
    "profile.description": "登記資料直接反映於個人設定，讓居民於一處管理身份、聯絡資料、可用時間及歷史紀錄。",
    "profile.username": "用戶名",
    "profile.phone": "電話號碼",
    "profile.loginEmail": "登入電郵",
    "profile.currentState": "目前狀態",
    "profile.country": "國家",
    "profile.jobTitle": "職位",
    "profile.bio": "個人簡介",
    "profile.availableTimeSlot": "可用時間",
    "profile.history": "歷史紀錄",
    "profile.deletedAt": "刪除於",
    "profile.statusSecurity": "狀態與安全",
    "profile.onlineStatus": "線上狀態",
    "profile.personalId": "個人證件顯示",
    "profile.password": "密碼",
    "profile.maskedId": "已遮蔽，儲存於伺服器端",
    "profile.changePassword": "透過安全重設流程更改",
    "settings.description": "網站全局偏好設定集中於此，外觀、通知、語言及私隱控制分別設於各標籤頁。",
    "settings.appearance": "外觀",
    "settings.notificationPref": "通知偏好",
    "settings.languageRegion": "語言及地區",
    "settings.privacySecurity": "私隱與安全",
    "settings.displayMode": "顯示模式",
    "settings.displayModeDesc": "在亮色及深色模式之間切換。",
    "settings.fontScale": "字體大小",
    "settings.languageTitle": "語言",
    "settings.languageDesc": "即時切換英文及繁體中文。",
    "settings.currentLight": "目前：亮色",
    "settings.currentDark": "目前：深色",
    "settings.currentEn": "目前：英文",
    "settings.currentZh": "目前：中文",
    "settings.notif.messages": "訊息",
    "settings.notif.likes": "讚好及留言",
    "settings.notif.friends": "好友申請",
    "settings.notif.quests": "任務提示",
    "settings.notif.bookings": "預約更新",
    "settings.notif.critical": "重要通知或預設啟用。",
    "settings.notif.optional": "可選通知。",
    "settings.privacy.blockList": "封鎖名單管理",
    "settings.privacy.password": "密碼及電郵安全",
    "settings.privacy.maskedId": "個人證件遮蔽顯示",
    "settings.privacy.alerts": "重要通知偏好",
    "settings.privacy.desc": "此模組為 Firebase 個人資料持久化及管理員安全審計記錄而準備。",
    "feedback.placeholder": "在此分享您的想法、意見或建議。",
    "feedback.upload": "上傳最多 5 張圖片或影片",
    "feedback.fileTypes": "JPG、PNG、WEBP 或 MP4",
    "feedback.submit": "提交回饋",
    "feedback.uploading": "上傳中...",
    "about.platformNote": "平台結構設計旨在保持社交、運營及大廈特定工具的模組化，讓功能更新能夠安全演進，不影響其他範疇。",
  },
};

export function t(language: Language, key: CopyKey) {
  return copy[language][key] ?? copy.en[key];
}