import { useState } from 'react';
import { createDonation } from '../services/donationService';

export const useDonationFlow = (campaign, onDonationSuccess) => {
    const [donationAmount, setDonationAmount] = useState('');
    const [allocationId, setAllocationId] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [lastCompletedPayment, setLastCompletedPayment] = useState(null);
    const [activeModal, setActiveModal] = useState(null);

    const handleInitialSubmit = (event) => {
        event.preventDefault();
        setSuccessMessage('');

        // Client-side check: ensure campaign is accepting donations now
        const now = new Date();
        const start = campaign?.start_date ? new Date(campaign.start_date) : null;
        const end = campaign?.end_date ? new Date(campaign.end_date) : null;
        const statusActive = campaign?.status === 'active';

        if (!statusActive || (start && now < start) || (end && now > end)) {
            setError('This campaign is not accepting donations at this time.');
            return;
        }

        if (Number(donationAmount) > 0) {
            setActiveModal('confirm');
        }
    };

    const proceedToPaymentGateway = () => {
        setActiveModal('checkout');
    };

    const executeDonation = async (paymentDetails) => {
        setError('');

        try {
            await createDonation({
                campaign_id: Number(campaign?.id),
                amount: Number(donationAmount),
                allocation_id: allocationId ? Number(allocationId) : undefined,
                transaction_id: paymentDetails.transaction_id,
                payment_method: paymentDetails.method,
                request_tax_receipt: paymentDetails.request_tax_receipt,
                tax_name: paymentDetails.tax_name,
                tax_id_number: paymentDetails.tax_id_number,
                tax_address: paymentDetails.tax_address,
            });

            setLastCompletedPayment({
                amount: donationAmount,
                method: paymentDetails.method,
            });

            setActiveModal('success');

            if (onDonationSuccess) {
                await onDonationSuccess();
            }
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to process donation.');
            setActiveModal(null);
        }
    };

    const closeSuccessModal = () => {
        setActiveModal(null);

        if (lastCompletedPayment) {
            setSuccessMessage(
                `Successful Donation: RM ${lastCompletedPayment.amount} via ${lastCompletedPayment.method?.toUpperCase()}. Thank you!`
            );
        }

        setDonationAmount('');
        setAllocationId('');
    };

    return {
        donationAmount,
        allocationId,
        error,
        successMessage,
        lastCompletedPayment,
        activeModal,
        setDonationAmount,
        setAllocationId,
        setActiveModal,
        handleInitialSubmit,
        proceedToPaymentGateway,
        executeDonation,
        closeSuccessModal,
    };
};
