"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { stripePromise } from "@/lib/stripe"
import { Elements } from "@stripe/react-stripe-js"
import { PaymentForm } from "@/components/payment-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { FloatingLabelInput } from "@/components/ui/floating-label-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DatePicker } from "@/components/ui/date-picker"
import { SegmentedDateInput } from "@/components/ui/segmented-date-input"
import { PhoneInput } from "@/components/ui/phone-input"
import { cn } from "@/lib/utils"
import { Check, ChevronLeft, ChevronRight, CreditCard, User, MapPin, Shirt, Mail, Phone, Map, Building2, Hash, Ticket, UserPlus, CheckCircle2, Star } from "lucide-react"

const phoneRegex = new RegExp(
    /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const formSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    middleName: z.string().optional(),
    lastName: z.string().min(2, "Last name is required"),
    nickname: z.string().min(1, "Nickname is required (or N/A)"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(phoneRegex, "Invalid phone number"),
    birthDate: z.date({
        message: "Date of birth is required",
    }).refine((date) => {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 18 && age <= 120;
    }, {
        message: "You must be at least 18 years old",
    }),
    address1: z.string().min(5, "Address is required"),
    address2: z.string().optional(),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Zip code is required"),
    referralSource: z.string().min(1, "Please select how you heard about us"),
    referrerName: z.string().optional(),
    isDbnMember: z.enum(["yes", "no"], {
        message: "Please select if you are a DBN member",
    }),
    birthCityState: z.string().min(2, "Birth city and state is required"),
    membershipStatus: z.enum(["new", "current", "past"], {
        message: "Please select your membership status",
    }),
    membershipLevel: z.string().min(1, "Please select a membership level"),
    shirtSize: z.string().min(1, "Shirt size is required"),
    jacketSize: z.string().min(1, "Jacket size is required"),
    couponCode: z.string().optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
}).refine((data) => {
    if (data.referralSource === "referral" && !data.referrerName) {
        return false;
    }
    return true;
}, {
    message: "Referrer name is required",
    path: ["referrerName"],
});

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const years = Array.from({ length: 2007 - 1940 + 1 }, (_, i) => (2007 - i).toString());
const sizes = ["Small", "Medium", "Large", "XL", "2X", "3X"];

const steps = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Address & Origin", icon: MapPin },
    { id: 3, title: "Membership", icon: CreditCard },
    { id: 4, title: "Review & Terms", icon: Check },
    { id: 5, title: "Payment", icon: CreditCard },
];

export function MembershipForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [price, setPrice] = useState(0);
    const [direction, setDirection] = useState(0);
    const [clientSecret, setClientSecret] = useState("");
    const [paymentIntentId, setPaymentIntentId] = useState("");
    const [formData, setFormData] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            middleName: "",
            lastName: "",
            nickname: "",
            email: "",
            phone: "",
            address1: "",
            address2: "",
            city: "",
            state: "",
            zipCode: "",
            referrerName: "",
            birthCityState: "",
            couponCode: "",
            termsAccepted: false,
        },
        mode: "onChange",
    });

    const membershipStatus = form.watch("membershipStatus");
    const membershipLevel = form.watch("membershipLevel");
    const referralSource = form.watch("referralSource");

    useEffect(() => {
        let newPrice = 0;
        if (membershipLevel === "basic") newPrice = 75;
        if (membershipLevel === "plus") newPrice = 175;
        if (membershipLevel === "premium") newPrice = 225;
        setPrice(newPrice);
    }, [membershipLevel]);

    const validateStep = async (step: number) => {
        let fieldsToValidate: any[] = [];
        switch (step) {
            case 1:
                fieldsToValidate = ["firstName", "lastName", "nickname", "email", "phone", "birthDate"];
                break;
            case 2:
                fieldsToValidate = ["address1", "city", "state", "zipCode", "referralSource", "birthCityState"];
                if (referralSource === "referral") fieldsToValidate.push("referrerName");
                break;
            case 3:
                fieldsToValidate = ["membershipStatus", "membershipLevel", "shirtSize", "jacketSize", "isDbnMember"];
                break;
            case 4:
                fieldsToValidate = ["termsAccepted"];
                break;
            case 5:
                // Payment step - no validation needed
                return true;
        }
        const result = await form.trigger(fieldsToValidate);
        return result;
    };

    const nextStep = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid) {
            // If moving from step 4 to 5 (payment), create payment intent
            if (currentStep === 4 && price > 0) {
                await createPaymentIntent();
            }
            setDirection(1);
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const createPaymentIntent = async () => {
        setIsProcessing(true);
        console.log('=== Creating Payment Intent ===');
        console.log('Amount:', price);
        console.log('Email:', form.getValues("email"));

        try {
            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: price,
                    metadata: {
                        email: form.getValues("email"),
                        name: `${form.getValues("firstName")} ${form.getValues("lastName")}`,
                        membershipLevel: form.getValues("membershipLevel"),
                    },
                }),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Payment Intent created:', data);

            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId);
                console.log('✅ Client secret set successfully');
            } else if (data.error) {
                console.error('API returned error:', data.error);
                throw new Error(data.error);
            } else {
                console.error('No clientSecret in response');
                throw new Error('No client secret received');
            }
        } catch (error: any) {
            console.error("Error creating payment intent:", error);
            alert(`Failed to initialize payment: ${error.message}\n\nPlease check:\n1. Your .env.local file has Stripe keys\n2. The API route is working\n3. Stripe keys are valid`);
        } finally {
            setIsProcessing(false);
        }
    };

    const prevStep = () => {
        setDirection(-1);
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    const handlePaymentSuccess = async () => {
        if (isSubmitting) return; // Prevent double submission

        setIsSubmitting(true);
        const values = form.getValues();

        console.log('Payment successful, saving to database...');

        try {
            const { data, error } = await supabase
                .from('memberships')
                .insert([
                    {
                        first_name: values.firstName,
                        middle_name: values.middleName,
                        last_name: values.lastName,
                        nickname: values.nickname,
                        email: values.email,
                        phone: values.phone,
                        birth_date: values.birthDate.toISOString().split('T')[0],
                        address1: values.address1,
                        address2: values.address2,
                        city: values.city,
                        state: values.state,
                        zip_code: values.zipCode,
                        referral_source: values.referralSource,
                        referrer_name: values.referrerName,
                        is_dbn_member: values.isDbnMember,
                        birth_city_state: values.birthCityState,
                        membership_status: values.membershipStatus,
                        membership_level: values.membershipLevel,
                        shirt_size: values.shirtSize,
                        jacket_size: values.jacketSize,
                        coupon_code: values.couponCode,
                        terms_accepted: values.termsAccepted,
                        total_price: price,
                        payment_intent_id: paymentIntentId,
                    }
                ])
                .select();

            if (error) {
                console.error('Error submitting form:', error);
                alert('Payment successful but failed to save application. Please contact support with payment ID: ' + paymentIntentId);
            } else {
                console.log('Submission saved successfully:', data);
                setIsSubmitted(true);
                // Don't reset form yet - show success message
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Payment successful but an error occurred saving your application. Please contact support with payment ID: ' + paymentIntentId);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentError = (error: string) => {
        console.error('Payment error:', error);
        // Don't do anything - stay on payment page for retry
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Store form data and move to payment step
        setFormData(values);
        nextStep();
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    // Success Screen
    if (isSubmitted) {
        return (
            <div className="w-full max-w-3xl mx-auto">
                <Card className="shadow-2xl border-none overflow-hidden bg-white/90 backdrop-blur-sm">
                    <CardHeader className="text-center space-y-4 bg-gradient-to-r from-green-50 via-green-100 to-green-50 pb-8 pt-8">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in-50 duration-500">
                                <CheckCircle2 className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-green-700 tracking-tight">
                            Payment Successful!
                        </CardTitle>
                        <CardDescription className="text-lg font-medium text-green-600">
                            Welcome to The RISEUP Tour Fan Club
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-8 md:p-12">
                        <div className="space-y-6 text-center">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-primary">Thank You!</h3>
                                <p className="text-muted-foreground text-lg">
                                    Your membership application has been submitted successfully.
                                </p>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-xl border-2 border-primary/20">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Membership Level:</span>
                                        <span className="font-bold capitalize">{form.getValues("membershipLevel")}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Amount Paid:</span>
                                        <span className="font-bold text-green-600">${price.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Payment ID:</span>
                                        <span className="font-mono text-xs">{paymentIntentId}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-start gap-3 text-left">
                                    <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Check Your Email</p>
                                        <p className="text-sm text-muted-foreground">
                                            A confirmation email has been sent to <strong>{form.getValues("email")}</strong>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-left">
                                    <Ticket className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">What's Next?</p>
                                        <p className="text-sm text-muted-foreground">
                                            Your membership items will be processed and shipped within 2-3 weeks.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-left">
                                    <CreditCard className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Receipt</p>
                                        <p className="text-sm text-muted-foreground">
                                            Stripe will send a payment receipt to your email shortly.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button
                                    onClick={() => {
                                        setIsSubmitted(false);
                                        form.reset();
                                        setCurrentStep(1);
                                        setClientSecret("");
                                        setPaymentIntentId("");
                                    }}
                                    className="w-full h-14 text-lg"
                                    variant="outline"
                                >
                                    Submit Another Application
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Header & Progress */}
            <div className="mb-8 space-y-4">
                <div className="flex justify-between items-end px-2">
                    <span className="text-sm font-medium text-muted-foreground ml-auto">
                        Step {currentStep} of {steps.length}
                    </span>
                </div>

                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute left-5 right-5 top-5 -translate-y-1/2 h-1 bg-muted -z-0 rounded-full">
                        {/* Progress Bar Foreground */}
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        />
                    </div>

                    {/* Steps */}
                    <div className="flex justify-between items-start relative z-10">
                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = step.id === currentStep;
                            const isCompleted = step.id < currentStep;
                            return (
                                <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2 min-w-[80px]">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                                            isActive ? "border-primary text-primary scale-110 shadow-lg shadow-primary/30 ring-4 ring-primary/10" :
                                                isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground"
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={cn(
                                        "text-xs font-medium transition-colors duration-300 text-center max-w-[100px]",
                                        isActive ? "text-primary font-bold" : "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <Card className="shadow-2xl border-none overflow-hidden bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center space-y-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pb-8 pt-8">
                    <div className="flex justify-center">
                        <img
                            src="/RISEUP.png"
                            alt="RISE Fan Club Logo"
                            className="h-24 w-auto object-contain"
                        />
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary tracking-tight">The RISEUP Tour Fan Club</CardTitle>
                    <CardDescription className="text-lg font-medium">2026 Membership Application</CardDescription>
                </CardHeader>

                <CardContent className="p-6 md:p-10 min-h-[500px]">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="w-full"
                                >
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="First Name"
                                                                    placeholder="John"
                                                                    icon={<User className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="middleName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="Middle Name"
                                                                    placeholder="Optional"
                                                                    icon={<User className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="Last Name"
                                                                    placeholder="Doe"
                                                                    icon={<User className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription className="text-xs mt-1">Legal name as on Driver License</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="nickname"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Nickname (Badge Name)"
                                                                placeholder="Your nickname or N/A"
                                                                icon={<User className="h-4 w-4" />}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-xs mt-1">Displayed on badge. No profanity. Put N/A if none.</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="Email Address"
                                                                    type="email"
                                                                    placeholder="name@example.com"
                                                                    icon={<Mail className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <PhoneInput
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="birthDate"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-3">
                                                        <FormLabel className="text-base font-semibold">Date of Birth</FormLabel>
                                                        <FormControl>
                                                            <SegmentedDateInput
                                                                value={field.value}
                                                                onChange={field.onChange}
                                                                disabled={false}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-xs mt-8">
                                                            Must be 18 years or older. Enter as MM/DD/YYYY
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="address1"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Street Address"
                                                                placeholder="123 Main Street"
                                                                icon={<MapPin className="h-4 w-4" />}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="address2"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Address Line 2 (Optional)"
                                                                placeholder="Apt, Suite, Floor"
                                                                icon={<MapPin className="h-4 w-4" />}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="city"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="City"
                                                                    placeholder="Atlanta"
                                                                    icon={<Building2 className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="state"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="State/Province"
                                                                    placeholder="GA"
                                                                    icon={<Map className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="zipCode"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <FloatingLabelInput
                                                                    label="Postal/Zip Code"
                                                                    placeholder="30303"
                                                                    icon={<Hash className="h-4 w-4" />}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <Separator className="my-6" />

                                            <FormField
                                                control={form.control}
                                                name="birthCityState"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Birth Place (City and State)"
                                                                placeholder="Atlanta, GA"
                                                                icon={<MapPin className="h-4 w-4" />}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="referralSource"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-base font-semibold">How did you hear about TRTFC?</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-14 w-full">
                                                                        <SelectValue placeholder="Select an option" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="returning">N/A - Returning member</SelectItem>
                                                                    <SelectItem value="social">Social media</SelectItem>
                                                                    <SelectItem value="website">Website</SelectItem>
                                                                    <SelectItem value="referral">Member referral</SelectItem>
                                                                    <SelectItem value="other">Other</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {referralSource === "referral" && (
                                                    <FormField
                                                        control={form.control}
                                                        name="referrerName"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <FloatingLabelInput
                                                                        label="Referred by (Member Name)"
                                                                        placeholder="Member's full name"
                                                                        icon={<UserPlus className="h-4 w-4" />}
                                                                        {...field}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-8">
                                            <FormField
                                                control={form.control}
                                                name="membershipStatus"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-4">
                                                        <FormLabel className="text-lg font-semibold">Current Status (as of 2025)</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    form.setValue("membershipLevel", "");
                                                                }}
                                                                defaultValue={field.value}
                                                                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                            >
                                                                {["new", "current", "past"].map((status) => (
                                                                    <FormItem key={status}>
                                                                        <FormControl>
                                                                            <RadioGroupItem value={status} className="peer sr-only" />
                                                                        </FormControl>
                                                                        <FormLabel className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all h-full text-center">
                                                                            <span className="text-lg font-bold capitalize">{status} Member</span>
                                                                            <span className="text-sm text-muted-foreground mt-2">
                                                                                {status === "new" && "Never joined TRTFC previously"}
                                                                                {status === "current" && "Paid member for 2025 season"}
                                                                                {status === "past" && "Member from 2024 or earlier"}
                                                                            </span>
                                                                        </FormLabel>
                                                                    </FormItem>
                                                                ))}
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            {membershipStatus && (
                                                <FormField
                                                    control={form.control}
                                                    name="membershipLevel"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-4">
                                                            <FormLabel className="text-lg font-semibold">Select Membership Level</FormLabel>
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                                >
                                                                    {membershipStatus === "new" && (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <RadioGroupItem value="basic" className="peer sr-only" />
                                                                            </FormControl>
                                                                            <FormLabel className="relative flex flex-col justify-between rounded-xl border-2 border-muted bg-card p-6 hover:border-primary/50 hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-xl cursor-pointer transition-all duration-300 h-full group">
                                                                                <div className="absolute top-4 right-4 opacity-0 group-peer-data-[state=checked]:opacity-100 transition-opacity duration-300 text-primary">
                                                                                    <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xl font-bold text-muted-foreground group-peer-data-[state=checked]:text-primary transition-colors">Basic</div>
                                                                                    <div className="text-3xl font-extrabold mt-2">$75</div>
                                                                                    <div className="mt-4 pt-4 border-t border-border/50">
                                                                                        <ul className="text-sm text-muted-foreground space-y-2">
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Membership Emails</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 2026 Badge</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Lanyard</li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}

                                                                    {(membershipStatus === "new" || membershipStatus === "past" || membershipStatus === "current") && (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <RadioGroupItem value="plus" className="peer sr-only" />
                                                                            </FormControl>
                                                                            <FormLabel className="relative flex flex-col justify-between rounded-xl border-2 border-muted bg-card p-6 hover:border-primary/50 hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-xl cursor-pointer transition-all duration-300 h-full group">
                                                                                <div className="absolute top-4 right-4 opacity-0 group-peer-data-[state=checked]:opacity-100 transition-opacity duration-300 text-primary">
                                                                                    <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xl font-bold text-muted-foreground group-peer-data-[state=checked]:text-primary transition-colors">Plus</div>
                                                                                    <div className="text-3xl font-extrabold mt-2">
                                                                                        {membershipStatus === "current" ? "Renew" : "$175"}
                                                                                    </div>
                                                                                    <div className="mt-4 pt-4 border-t border-border/50">
                                                                                        <ul className="text-sm text-muted-foreground space-y-2">
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> All Basic Items</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Official T-Shirt</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 2026 Jacket</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Keychain & Coin</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Bag Tag</li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}

                                                                    {(membershipStatus === "new" || membershipStatus === "past" || membershipStatus === "current") && (
                                                                        <FormItem>
                                                                            <FormControl>
                                                                                <RadioGroupItem value="premium" className="peer sr-only" />
                                                                            </FormControl>
                                                                            <FormLabel className="relative flex flex-col justify-between rounded-xl border-2 border-muted bg-card p-6 hover:border-primary/50 hover:shadow-md peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:shadow-xl cursor-pointer transition-all duration-300 h-full group overflow-hidden">
                                                                                <div className="absolute top-0 right-0 bg-gradient-to-bl from-yellow-500 to-amber-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm flex items-center gap-1">
                                                                                    <Star className="w-3 h-3 fill-current" /> RECOMMENDED
                                                                                </div>
                                                                                <div className="absolute top-8 right-4 opacity-0 group-peer-data-[state=checked]:opacity-100 transition-opacity duration-300 text-primary">
                                                                                    <CheckCircle2 className="w-6 h-6 fill-primary text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-xl font-bold text-muted-foreground group-peer-data-[state=checked]:text-primary transition-colors">Premium</div>
                                                                                    <div className="text-3xl font-extrabold mt-2">
                                                                                        {membershipStatus === "current" ? "Upgrade" : "$225"}
                                                                                    </div>
                                                                                    <div className="mt-4 pt-4 border-t border-border/50">
                                                                                        <ul className="text-sm text-muted-foreground space-y-2">
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Exclusive Bomber Jacket</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> VIP Recognition</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Lapel Pin</li>
                                                                                            <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> All Plus Items</li>
                                                                                        </ul>
                                                                                    </div>
                                                                                </div>
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="shirtSize"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                                <Shirt className="h-4 w-4 text-primary" />
                                                                Shirt Size (Unisex)
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-14 w-full">
                                                                        <SelectValue placeholder="Select Size" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="jacketSize"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormLabel className="text-base font-semibold flex items-center gap-2">
                                                                <Shirt className="h-4 w-4 text-primary" />
                                                                Jacket Size (Unisex)
                                                            </FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="h-14 w-full">
                                                                        <SelectValue placeholder="Select Size" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="isDbnMember"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-4 bg-gradient-to-br from-primary/5 to-primary/10 p-6 rounded-xl border-2 border-primary/20">
                                                        <FormLabel className="text-base font-semibold">Are you a current DBN Member (2025 season)?</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                                className="flex space-x-6"
                                                            >
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="yes" className="h-5 w-5" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-medium text-base cursor-pointer">Yes</FormLabel>
                                                                </FormItem>
                                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                                    <FormControl>
                                                                        <RadioGroupItem value="no" className="h-5 w-5" />
                                                                    </FormControl>
                                                                    <FormLabel className="font-medium text-base cursor-pointer">No</FormLabel>
                                                                </FormItem>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormDescription className="text-sm font-medium">DBN = Dirty Bird Nest, Section 134</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 5 && (
                                        <div className="space-y-6">
                                            <div className="text-center space-y-2 mb-6">
                                                <h3 className="text-2xl font-bold text-primary">Complete Your Payment</h3>
                                                <p className="text-muted-foreground">
                                                    Secure payment powered by Stripe
                                                </p>
                                            </div>

                                            {clientSecret && stripePromise ? (
                                                <Elements
                                                    options={{
                                                        clientSecret,
                                                        appearance: {
                                                            theme: 'stripe',
                                                            variables: {
                                                                colorPrimary: '#9F0001',
                                                            },
                                                        },
                                                    }}
                                                    stripe={stripePromise}
                                                >
                                                    <PaymentForm
                                                        amount={price}
                                                        onSuccess={handlePaymentSuccess}
                                                        onError={handlePaymentError}
                                                    />
                                                </Elements>
                                            ) : (
                                                <div className="flex items-center justify-center p-8">
                                                    <div className="text-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                                        <p className="text-muted-foreground">Initializing secure payment...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {currentStep === 4 && (
                                        <div className="space-y-6">
                                            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                                                <h3 className="text-xl font-bold text-primary">Summary</h3>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">Name:</span>
                                                        <p className="font-medium">{form.getValues("firstName")} {form.getValues("lastName")}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Email:</span>
                                                        <p className="font-medium">{form.getValues("email")}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Membership:</span>
                                                        <p className="font-medium capitalize">{form.getValues("membershipLevel")} ({form.getValues("membershipStatus")})</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">Total Price:</span>
                                                        <p className="font-bold text-lg text-primary">${price}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="couponCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <FloatingLabelInput
                                                                label="Coupon Code (Optional)"
                                                                placeholder="Enter code"
                                                                icon={<Ticket className="h-4 w-4" />}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-4">
                                                <h3 className="text-lg font-semibold text-primary">Terms and Conditions</h3>
                                                <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-background">
                                                    <div className="text-sm space-y-4">
                                                        <p><strong>Code of Conduct for The RISEUP Tour Fan Club (TRTFC)</strong></p>
                                                        <p>By joining TRTFC, you agree to abide by the following rules and regulations...</p>
                                                        <p>1. Respect all members and staff at all times.</p>
                                                        <p>2. No harassment, discrimination, or offensive behavior will be tolerated.</p>
                                                        <p>3. Represent the club with dignity during all events and gatherings.</p>
                                                        <p>4. Membership fees are non-refundable once processed.</p>
                                                        <p>5. The club reserves the right to revoke membership for violations of the code of conduct.</p>
                                                        <p>(This is a placeholder for the full legal text required by the organization.)</p>
                                                    </div>
                                                </ScrollArea>
                                                <FormField
                                                    control={form.control}
                                                    name="termsAccepted"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/10">
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value}
                                                                    onCheckedChange={field.onChange}
                                                                />
                                                            </FormControl>
                                                            <div className="space-y-1 leading-none">
                                                                <FormLabel className="cursor-pointer">
                                                                    I agree to abide by the Code of Conduct for The RISEUP Tour Fan Club (TRTFC).
                                                                </FormLabel>
                                                                <FormMessage />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {currentStep < 5 && (
                                <div className="flex justify-between pt-8 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                        className="w-32"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>

                                    {currentStep < 4 ? (
                                        <Button type="button" onClick={nextStep} className="w-32" disabled={isProcessing}>
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="w-auto px-8 bg-primary hover:bg-primary/90 text-lg"
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? "Processing..." : "Proceed to Payment"}
                                            <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            )}

                            {currentStep === 5 && (
                                <div className="flex justify-start pt-8 border-t">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={prevStep}
                                        className="w-32"
                                    >
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Back
                                    </Button>
                                </div>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
