export let globalActiveDevice = null;

export const setGlobalActiveDevice = (device) => {
    globalActiveDevice = device;
};

export const getSavedPrinterName = () => {
    return localStorage.getItem('savedPrinterName') || '';
};

export const getSavedPrinterId = () => {
    return localStorage.getItem('savedPrinterId') || '';
};
