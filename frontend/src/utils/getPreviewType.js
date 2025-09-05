const getPreviewType = (extension) => {
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension)) return 'image';
    if (extension === 'pdf') return 'pdf';
    if (extension === 'txt') return 'text';
    return null;
};

export default getPreviewType;