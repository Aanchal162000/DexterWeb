import { useEffect, useState } from 'react'


function useModal(modalCodeName: string) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => setIsModalOpen(sessionStorage.getItem(modalCodeName) ? false : true), []);

    const closeModal = () => {
        setIsModalOpen(false);
        sessionStorage.setItem(modalCodeName, "true");
    };

    return [isModalOpen, setIsModalOpen, closeModal];
}

export default useModal
