import styled from 'styled-components';
import { motion } from 'framer-motion';

const Overlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    z-index: 40;
`;

export const FocusOverlay = ({ onClick }) => {
    return (
        <Overlay
            onClick={onClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        />
    )
}