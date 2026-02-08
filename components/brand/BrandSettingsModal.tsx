'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Upload, Palette, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import { BrandKit } from '@/lib/slidesStore'
import { toast } from 'sonner'

interface BrandSettingsModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (brand: BrandKit) => void
    currentBrand: BrandKit | null
}

export function BrandSettingsModal({ isOpen, onClose, onSave, currentBrand }: BrandSettingsModalProps) {
    const [name, setName] = useState(currentBrand?.name || 'My Brand')
    const [primaryColor, setPrimaryColor] = useState(currentBrand?.primaryColor || '#ec4899')
    const [secondaryColor, setSecondaryColor] = useState(currentBrand?.secondaryColor || '#a855f7')
    const [fontFamily, setFontFamily] = useState(currentBrand?.fontFamily || 'Inter')
    const [logoUrl, setLogoUrl] = useState(currentBrand?.logoUrl || '')
    const [isLoading, setIsLoading] = useState(false)

    // Load from DB on open
    useEffect(() => {
        if (isOpen) {
            loadBrandKit()
        }
    }, [isOpen])

    const loadBrandKit = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('brand_kits')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (data) {
            setName(data.name)
            setPrimaryColor(data.primary_color)
            setSecondaryColor(data.secondary_color)
            setFontFamily(data.font_family)
            setLogoUrl(data.logo_url || '')
        }
    }

    const handleSave = async () => {
        setIsLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast.error("Please login to save brand kit")
            setIsLoading(false)
            return
        }

        const brandData = {
            user_id: user.id,
            name,
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            font_family: fontFamily,
            logo_url: logoUrl
        }

        // Upsert to DB
        // Check if exists first for simplicity or stick to simple upsert if ID known? 
        // We'll just delete old and insert new or better: select id.

        const { data: existing } = await supabase.from('brand_kits').select('id').eq('user_id', user.id).single()

        let error;
        if (existing) {
            const res = await supabase.from('brand_kits').update(brandData).eq('id', existing.id)
            error = res.error
        } else {
            const res = await supabase.from('brand_kits').insert(brandData)
            error = res.error
        }

        if (error) {
            toast.error("Failed to save brand kit")
        } else {
            const kb: BrandKit = {
                name,
                primaryColor,
                secondaryColor,
                fontFamily,
                logoUrl
            }
            onSave(kb)
            toast.success("Brand kit saved & applied!")
            onClose()
        }
        setIsLoading(false)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Palette className="w-4 h-4 text-pink-500" />
                        Brand Kit
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase">Brand Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/10" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={e => setPrimaryColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                />
                                <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-white/5 border-white/10 h-8 font-mono text-xs" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-400 uppercase">Secondary Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={e => setSecondaryColor(e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                />
                                <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="bg-white/5 border-white/10 h-8 font-mono text-xs" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase flex items-center gap-2">
                            <Type className="w-4 h-4" /> Font Family
                        </label>
                        <select
                            value={fontFamily}
                            onChange={e => setFontFamily(e.target.value)}
                            className="w-full bg-[#1a1a2e] border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
                        >
                            <option value="Inter">Inter (System Default)</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Courier New">Courier New</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-400 uppercase flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Logo URL
                        </label>
                        <Input
                            value={logoUrl}
                            onChange={e => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className="bg-white/5 border-white/10"
                        />
                        <p className="text-[10px] text-gray-500">Paste a direct link to your logo image.</p>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5 flex justifies-end">
                    <Button onClick={handleSave} disabled={isLoading} className="w-full bg-pink-600 hover:bg-pink-500 text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isLoading ? 'Saving...' : 'Save Brand Kit'}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
