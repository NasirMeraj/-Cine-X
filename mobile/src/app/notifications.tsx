import React, {
    useCallback,
    useState
} from "react";

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    RefreshControl
} from "react-native";

import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
    router,
    useFocusEffect
} from "expo-router";

const API_URL = "http://192.168.1.41:5001";

type Notification = {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
    movie?: {
        _id: string;
        title: string;
        poster?: string;
    } | null;
};

export default function NotificationsScreen() {
    const [notifications, setNotifications] =
        useState<Notification[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const loadNotifications = async (
        showLoader = true
    ) => {
        try {
            if (showLoader) {
                setLoading(true);
            }

            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            const response =
                await axios.get(
                    `${API_URL}/api/notifications`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            setNotifications(
                response.data.notifications ||
                    []
            );

            setUnreadCount(
                response.data.unreadCount || 0
            );
        } catch (error: any) {
            console.log(
                "NOTIFICATIONS ERROR:",
                error?.response?.data ||
                    error.message
            );

            if (showLoader) {
                Alert.alert(
                    "Error",
                    "Failed to load notifications"
                );
            }
        } finally {
            if (showLoader) {
                setLoading(false);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadNotifications(
                notifications.length === 0
            );
        }, [])
    );

    const onRefresh = async () => {
        try {
            setRefreshing(true);

            await loadNotifications(false);
        } finally {
            setRefreshing(false);
        }
    };

    const markAsRead = async (
        notificationId: string
    ) => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            await axios.patch(
                `${API_URL}/api/notifications/${notificationId}/read`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setNotifications(
                (current) =>
                    current.map(
                        (item) =>
                            item._id ===
                            notificationId
                                ? {
                                      ...item,
                                      read: true
                                  }
                                : item
                    )
            );

            setUnreadCount(
                (current) =>
                    Math.max(
                        current -
                            (notifications.find(
                                (item) =>
                                    item._id ===
                                    notificationId &&
                                    !item.read
                            )
                                ? 1
                                : 0),
                        0
                    )
            );
        } catch (error) {
            console.log(
                "MARK READ ERROR:",
                error
            );
        }
    };

    const handleNotificationPress = async (
        notification: Notification
    ) => {
        await markAsRead(
            notification._id
        );

        if (
            notification.type === "movie" &&
            notification.movie?._id
        ) {
            router.push(
                `/${notification.movie._id}`
            );
        }
    };

    const markAllAsRead = async () => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            await axios.patch(
                `${API_URL}/api/notifications/read-all`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setNotifications(
                (current) =>
                    current.map(
                        (notification) => ({
                            ...notification,
                            read: true
                        })
                    )
            );

            setUnreadCount(0);
        } catch (error) {
            console.log(
                "MARK ALL READ ERROR:",
                error
            );
        }
    };

    const deleteNotification = async (
        notificationId: string
    ) => {
        try {
            const token =
                await AsyncStorage.getItem(
                    "token"
                );

            if (!token) {
                router.replace("/login");
                return;
            }

            const deleted =
                notifications.find(
                    (item) =>
                        item._id ===
                        notificationId
                );

            await axios.delete(
                `${API_URL}/api/notifications/${notificationId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            setNotifications(
                (current) =>
                    current.filter(
                        (item) =>
                            item._id !==
                            notificationId
                    )
            );

            if (
                deleted &&
                !deleted.read
            ) {
                setUnreadCount(
                    (current) =>
                        Math.max(
                            current - 1,
                            0
                        )
                );
            }
        } catch (error) {
            console.log(
                "DELETE NOTIFICATION ERROR:",
                error
            );
        }
    };

    const formatDate = (
        date: string
    ) => {
        const notificationDate =
            new Date(date);

        const now = new Date();

        const difference =
            now.getTime() -
            notificationDate.getTime();

        const seconds =
            Math.floor(
                difference / 1000
            );

        const minutes =
            Math.floor(
                seconds / 60
            );

        const hours =
            Math.floor(
                minutes / 60
            );

        const days =
            Math.floor(
                hours / 24
            );

        if (seconds < 60) {
            return "Just now";
        }

        if (minutes < 60) {
            return `${minutes} minute${
                minutes === 1
                    ? ""
                    : "s"
            } ago`;
        }

        if (hours < 24) {
            return `${hours} hour${
                hours === 1
                    ? ""
                    : "s"
            } ago`;
        }

        if (days === 1) {
            return "Yesterday";
        }

        if (days < 7) {
            return `${days} days ago`;
        }

        return notificationDate.toLocaleDateString();
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator
                    size="large"
                    color="#e50914"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading Notifications...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            onRefresh
                        }
                        tintColor="#e50914"
                        colors={[
                            "#e50914"
                        ]}
                    />
                }
            >
                <Text style={styles.logo}>
                    CINE-X
                </Text>

                <TouchableOpacity
                    style={
                        styles.backButton
                    }
                    onPress={() =>
                        router.back()
                    }
                >
                    <Text
                        style={
                            styles.backText
                        }
                    >
                        ← Back
                    </Text>
                </TouchableOpacity>

                <View
                    style={
                        styles.titleRow
                    }
                >
                    <View>
                        <Text
                            style={
                                styles.title
                            }
                        >
                            Notifications
                        </Text>

                        {unreadCount >
                            0 && (
                            <Text
                                style={
                                    styles.unreadText
                                }
                            >
                                {unreadCount} unread
                            </Text>
                        )}
                    </View>

                    {unreadCount >
                        0 && (
                        <TouchableOpacity
                            onPress={
                                markAllAsRead
                            }
                        >
                            <Text
                                style={
                                    styles.markAllText
                                }
                            >
                                Mark all read
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {notifications.length ===
                0 ? (
                    <View
                        style={
                            styles.empty
                        }
                    >
                        <Text
                            style={
                                styles.emptyIcon
                            }
                        >
                            🔔
                        </Text>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No Notifications
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            You're all caught up.
                        </Text>

                        <Text
                            style={
                                styles.refreshHint
                            }
                        >
                            Pull down to refresh
                        </Text>
                    </View>
                ) : (
                    notifications.map(
                        (notification) => (
                            <TouchableOpacity
                                key={
                                    notification._id
                                }
                                style={[
                                    styles.card,
                                    !notification.read &&
                                        styles.unreadCard
                                ]}
                                onPress={() =>
                                    handleNotificationPress(
                                        notification
                                    )
                                }
                                activeOpacity={
                                    0.8
                                }
                            >
                                <View
                                    style={
                                        styles.iconContainer
                                    }
                                >
                                    <Text
                                        style={
                                            styles.icon
                                        }
                                    >
                                        {notification.type ===
                                        "movie"
                                            ? "🎬"
                                            : notification.type ===
                                              "subscription"
                                            ? "💎"
                                            : "🔔"}
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.notificationContent
                                    }
                                >
                                    <View
                                        style={
                                            styles.notificationHeader
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.notificationTitle
                                            }
                                            numberOfLines={
                                                1
                                            }
                                        >
                                            {
                                                notification.title
                                            }
                                        </Text>

                                        {!notification.read && (
                                            <View
                                                style={
                                                    styles.dot
                                                }
                                            />
                                        )}
                                    </View>

                                    <Text
                                        style={
                                            styles.message
                                        }
                                    >
                                        {
                                            notification.message
                                        }
                                    </Text>

                                    <Text
                                        style={
                                            styles.date
                                        }
                                    >
                                        {formatDate(
                                            notification.createdAt
                                        )}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={
                                        styles.deleteButton
                                    }
                                    onPress={() =>
                                        deleteNotification(
                                            notification._id
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.deleteText
                                        }
                                    >
                                        ×
                                    </Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        )
                    )
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000"
    },

    content: {
        padding: 20,
        paddingTop: 55,
        paddingBottom: 100
    },

    center: {
        flex: 1,
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center"
    },

    loadingText: {
        color: "#888",
        marginTop: 12
    },

    logo: {
        color: "#e50914",
        fontSize: 30,
        fontWeight: "900",
        letterSpacing: 2,
        marginBottom: 15
    },

    backButton: {
        alignSelf: "flex-start",
        backgroundColor: "#222",
        paddingVertical: 9,
        paddingHorizontal: 15,
        borderRadius: 7,
        marginBottom: 25
    },

    backText: {
        color: "#fff",
        fontWeight: "bold"
    },

    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 25
    },

    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold"
    },

    unreadText: {
        color: "#e50914",
        fontSize: 13,
        marginTop: 4
    },

    markAllText: {
        color: "#e50914",
        fontSize: 13,
        fontWeight: "bold"
    },

    card: {
        backgroundColor: "#181818",
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#282828"
    },

    unreadCard: {
        borderColor: "#e50914"
    },

    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#252525",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12
    },

    icon: {
        fontSize: 22
    },

    notificationContent: {
        flex: 1
    },

    notificationHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5
    },

    notificationTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        flex: 1
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#e50914",
        marginLeft: 8
    },

    message: {
        color: "#aaa",
        fontSize: 13,
        lineHeight: 18
    },

    date: {
        color: "#666",
        fontSize: 11,
        marginTop: 7
    },

    deleteButton: {
        width: 30,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 5
    },

    deleteText: {
        color: "#777",
        fontSize: 24
    },

    empty: {
        alignItems: "center",
        paddingTop: 80
    },

    emptyIcon: {
        fontSize: 50,
        marginBottom: 20
    },

    emptyTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8
    },

    emptyText: {
        color: "#777",
        fontSize: 14
    },

    refreshHint: {
        color: "#555",
        fontSize: 12,
        marginTop: 15
    }
});