import dayjs from "dayjs";

export const formatDate = (date) => dayjs(date).format("DD MMM YYYY");
export const todayKey = () => dayjs().format("YYYY-MM-DD");
export const roleRoute = (role) => `/${role}`;
