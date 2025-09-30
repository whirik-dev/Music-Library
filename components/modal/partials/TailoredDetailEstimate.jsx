import { useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/Button2"

const TailoredDetailEstimate = ({ id, onJobUpdate, jobDetail, userBalance = 0 }) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 가격 계산
    const jobPrice = jobDetail?.price ? jobDetail.price * 10 : 0;
    const balanceAfterPayment = userBalance - jobPrice;
    const isInsufficientBalance = balanceAfterPayment < 0;

    const paymentHandler = async (action) => {
        if (!session?.user?.ssid) {
            setError('Authentication required');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const endpoint = action === 'approve'
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/approve/${id}`
                : `${process.env.NEXT_PUBLIC_BACKEND_URL}/tailored/cancel/${id}`;

            if(action === 'approve' && isInsufficientBalance) {
                setError('Insufficient balance to approve the job');
                return;
            }

            const response = await fetch(endpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.ssid}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // 성공 시 상위 컴포넌트에 알림
                if (onJobUpdate) {
                    onJobUpdate();
                }
                console.log(`${action} successful:`, data);
            } else {
                throw new Error(data.message || `Failed to ${action} job`);
            }
        } catch (err) {
            console.error(`Error ${action}ing job:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    estimate completed
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg mb-3">
                    <div className="text-xs text-foreground/50 uppercase mb-2">
                        Status
                    </div>
                    <div className="text-sm mb-2">
                        The estimate for your work has been completed.
                    </div>
                    <div className="text-sm text-foreground/70">
                        Click approve to proceed with the work.
                    </div>
                </div>

                <div className="bg-foreground/3 p-3 rounded-lg">
                    <div className="text-xs text-foreground/50 uppercase mb-1">
                        Offer Number
                    </div>
                    <div className="text-lg font-bold">
                        #{id}
                    </div>
                </div>
            </div>
            <div className="bg-foreground/3 p-3 rounded-lg">
                <div className="capitalize font-bold mb-3">
                    estimate
                </div>

                <div className="flex flex-row gap-3 mb-3">
                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Job Price (Estimate)
                        </div>
                        <div className="text-2xl font-bold">{jobPrice}</div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>

                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Your Balance
                        </div>
                        <div className="text-2xl font-bold">{userBalance}</div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>

                    <div className="bg-foreground/3 p-3 rounded-lg flex-1">
                        <div className="text-xs text-foreground/50 uppercase mb-1">
                            Balance After Payment
                        </div>
                        <div className={`text-2xl font-bold ${isInsufficientBalance ? 'text-red-500' : ''}`}>
                            {balanceAfterPayment}
                        </div>
                        <div className="text-xs text-foreground/50">credits</div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-3 text-sm">
                        {error}
                    </div>
                )}

                {isInsufficientBalance && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-3 text-sm">
                        Insufficient balance. You need {Math.abs(balanceAfterPayment)} more credits to proceed.
                    </div>
                )}

                <div className="flex flex-row gap-2 justify-end">
                    <Button
                        name={loading ? "cancelling..." : "cancel"}
                        onClick={() => paymentHandler('cancel')}
                        bg="bg-red-400 font-bold"
                        disabled={loading}
                    />
                    <Button
                        name={loading ? "approving..." : "approve"}
                        onClick={() => paymentHandler('approve')}
                        bg="bg-green-400 font-bold"
                        disabled={loading || isInsufficientBalance}
                    />
                </div>
            </div>
        </>
    )
}
export default TailoredDetailEstimate;