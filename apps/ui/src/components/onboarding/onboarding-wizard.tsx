import { Elements } from "@stripe/react-stripe-js";
import { useNavigate } from "@tanstack/react-router";
import { usePostHog } from "posthog-js/react";
import * as React from "react";
import { useState } from "react";

import { ApiKeyStep } from "./api-key-step";
import { CreditsStep } from "./credits-step";
import { PlanChoiceStep } from "./plan-choice-step";
import { ProviderKeyStep } from "./provider-key-step";
import { WelcomeStep } from "./welcome-step";
import { useDefaultOrganization } from "@/hooks/useOrganization";
import { Card, CardContent } from "@/lib/components/card";
import { Stepper } from "@/lib/components/stepper";
import { useApi } from "@/lib/fetch-client";
import { useStripe } from "@/lib/stripe";

type FlowType = "credits" | "byok" | null;

const getSteps = (flowType: FlowType) => [
	{
		id: "welcome",
		title: "Welcome",
		component: WelcomeStep,
	},
	{
		id: "api-key",
		title: "API Key",
		component: ApiKeyStep,
	},
	{
		id: "plan-choice",
		title: "Choose Plan",
		component: PlanChoiceStep,
	},
	{
		id: flowType === "credits" ? "credits" : "provider-key",
		title: flowType === "credits" ? "Credits" : "Provider Key",
		component: flowType === "credits" ? CreditsStep : ProviderKeyStep,
	},
];

export function OnboardingWizard() {
	const [activeStep, setActiveStep] = useState(0);
	const [flowType, setFlowType] = useState<FlowType>(null);
	const navigate = useNavigate();
	const posthog = usePostHog();
	const { stripe, isLoading: stripeLoading } = useStripe();
	const { data: organization } = useDefaultOrganization();
	const api = useApi();
	const completeOnboarding = api.useMutation(
		"post",
		"/user/me/complete-onboarding",
	);

	const STEPS = getSteps(flowType);

	const handleStepChange = async (step: number) => {
		if (step >= STEPS.length) {
			posthog.capture("onboarding_completed", {
				completedSteps: STEPS.map((step) => step.id),
				flowType,
			});

			await completeOnboarding.mutateAsync({});
			navigate({ to: "/dashboard" });
			return;
		}
		setActiveStep(step);
	};

	const handleSelectCredits = () => {
		setFlowType("credits");
		setActiveStep(3);
	};

	const handleSelectBYOK = () => {
		setFlowType("byok");
		setActiveStep(3);
	};

	const CurrentStepComponent = STEPS[activeStep].component;

	// Special handling for PlanChoiceStep to pass callbacks
	const renderCurrentStep = () => {
		if (activeStep === 2) {
			return (
				<PlanChoiceStep
					onSelectCredits={handleSelectCredits}
					onSelectBYOK={handleSelectBYOK}
				/>
			);
		}

		// For credits step, wrap with Stripe Elements
		if (activeStep === 3 && flowType === "credits") {
			return stripeLoading ? (
				<div className="p-6 text-center">Loading payment form...</div>
			) : (
				<Elements stripe={stripe}>
					<CreditsStep />
				</Elements>
			);
		}

		// For BYOK step
		if (activeStep === 3 && flowType === "byok") {
			return <ProviderKeyStep />;
		}

		// For other steps
		if (activeStep === 0) {
			return <WelcomeStep />;
		}

		if (activeStep === 1) {
			return <ApiKeyStep />;
		}

		return null;
	};

	return (
		<div className="container mx-auto max-w-3xl py-10">
			<Card>
				<CardContent className="p-6 sm:p-8">
					<Stepper
						steps={STEPS.map(({ id, title }) => ({
							id,
							title,
						}))}
						activeStep={activeStep}
						onStepChange={handleStepChange}
						className="mb-6"
					>
						{renderCurrentStep()}
					</Stepper>
				</CardContent>
			</Card>
		</div>
	);
}
