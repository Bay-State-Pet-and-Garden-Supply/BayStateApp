'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pet, PetType } from '@/lib/types'
import { createPet, updatePet } from '@/lib/account/pets'
import { toast } from 'sonner'

const petFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50),
    pet_type_id: z.string().min(1, 'Pet type is required'),
    breed: z.string().max(100).optional(),
    birth_date: z.date().optional(),
    weight_lbs: z.string().refine((val) => !val || !isNaN(parseFloat(val)), {
        message: 'Weight must be a number',
    }).optional(),
    dietary_notes: z.string().max(500).optional(),
})

type PetFormValues = z.infer<typeof petFormSchema>

interface PetFormProps {
    pet?: Pet
    petTypes: PetType[]
    onSuccess?: () => void
}

export function PetForm({ pet, petTypes, onSuccess }: PetFormProps) {
    const [loading, setLoading] = useState(false)

    const defaultValues: Partial<PetFormValues> = {
        name: pet?.name || '',
        pet_type_id: pet?.pet_type_id || '',
        breed: pet?.breed || '',
        birth_date: pet?.birth_date ? new Date(pet.birth_date) : undefined,
        weight_lbs: pet?.weight_lbs?.toString() || '',
        dietary_notes: pet?.dietary_notes || '',
    }

    const form = useForm<PetFormValues>({
        resolver: zodResolver(petFormSchema),
        defaultValues,
    })

    async function onSubmit(data: PetFormValues) {
        setLoading(true)
        try {
            const formattedData = {
                ...data,
                weight_lbs: data.weight_lbs ? parseFloat(data.weight_lbs) : null,
                birth_date: data.birth_date ? format(data.birth_date, 'yyyy-MM-dd') : null,
            }

            if (pet) {
                await updatePet(pet.id, formattedData)
                toast.success('Pet updated', {
                    description: `${data.name}'s profile has been updated.`,
                })
            } else {
                await createPet(formattedData)
                toast.success('Pet added', {
                    description: `${data.name} has been added to your profile.`,
                })
            }
            onSuccess?.()
        } catch (error) {
            toast.error('Error', {
                description: 'Something went wrong. Please try again.',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Pet's name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pet_type_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a pet type" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {petTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="breed"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Breed (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. Golden Retriever" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="birth_date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Birth Date (Optional)</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="weight_lbs"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Weight (lbs)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" placeholder="e.g. 15.5" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="dietary_notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Dietary Notes (Optional)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Allergies, preferences, or special diet..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                We&apos;ll use this to recommend safe treats and food.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {pet ? 'Save Changes' : 'Add Pet'}
                </Button>
            </form>
        </Form>
    )
}
