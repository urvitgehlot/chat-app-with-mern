import React from "react";

const ManageContactModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-md">
            <div className="w-full max-w-[400px] overflow-hidden rounded-xl border border-white/5 bg-[#2A3642] shadow-md">

                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-white/5 p-6">
                    <h3 className="text-lg font-bold text-white">
                        Manage Contact
                    </h3>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#8A9BA8] transition-colors hover:text-white"
                    >
                        <span className="material-symbols-outlined">
                            close
                        </span>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6 p-6">

                    {/* Mute Notifications */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[#1e7e9a]">
                            <span className="material-symbols-outlined text-lg">
                                notifications_off
                            </span>

                            <h4 className="text-xs font-bold uppercase tracking-wider">
                                Mute Notifications
                            </h4>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                className="rounded-lg bg-[#3A4753] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e7e9a]"
                            >
                                8 Hours
                            </button>

                            <button
                                type="button"
                                className="rounded-lg bg-[#3A4753] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e7e9a]"
                            >
                                1 Week
                            </button>

                            <button
                                type="button"
                                className="rounded-lg bg-[#3A4753] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e7e9a]"
                            >
                                Always
                            </button>
                        </div>
                    </div>

                    {/* Block Contact */}
                    <div className="border-t border-white/5 pt-6">
                        <div className="space-y-3">

                            <div className="flex items-center gap-2 text-[#C62828]">
                                <span className="material-symbols-outlined text-lg">
                                    block
                                </span>

                                <h4 className="text-xs font-bold uppercase tracking-wider">
                                    Block Contact
                                </h4>
                            </div>

                            <p className="text-xs leading-relaxed text-[#8A9BA8]">
                                Blocking Sarah Miller will prevent them from
                                sending you messages or seeing your status.
                            </p>

                            <button
                                type="button"
                                className="w-full rounded-xl bg-[#C62828] py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 active:scale-95"
                            >
                                Block Sarah Miller
                            </button>

                        </div>
                    </div>

                </div>

                {/* Modal Footer */}
                <div className="flex justify-end bg-[#1A242F] p-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-[#8A9BA8] transition-colors hover:text-white"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ManageContactModal;