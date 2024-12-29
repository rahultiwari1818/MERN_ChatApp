import React, { createContext, useContext, useState } from 'react';
import Overlay from '../Components/Common/Overlay';

// Create Chat Context
const OverlayContext = createContext();

export default function OverlayProvider({ children }) {
    const [showOverlay, setShowOverlay] = useState(false);

    const setOverlay = async (val) => {
        setShowOverlay(() => val);
    }

    return (
        <OverlayContext.Provider value={{ showOverlay, setOverlay }}>
            {
                showOverlay ?
                    <Overlay />
                    :
                    children
            }
        </OverlayContext.Provider>
    );
}

export const useOverlay = () => {
    return useContext(OverlayContext);
};
