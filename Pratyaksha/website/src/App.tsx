import { useStepScroll, STEPS } from '@/hooks/useStepScroll'
import { StepFramePlayer } from '@/components/BrainScene/StepFramePlayer'
import { StepNavbar } from '@/components/Navigation/StepNavbar'
import {
  HeroOverlay,
  ProblemOverlay,
  SolutionOverlay,
  FeaturesOverlay,
  CTAOverlay,
} from '@/components/Overlays'
import { STATES } from '@/lib/constants'

function App() {
  const { currentStep, stepConfig, animationProgress, isAnimating, isLocked, totalSteps, direction, navigateToTextStep, overlayOpacities } = useStepScroll()

  // Get overlay props from the opacity map for smooth cross-fade
  const getOverlayProps = (state: number) => {
    const overlayState = overlayOpacities[state as keyof typeof overlayOpacities]
    return {
      isVisible: overlayState.opacity > 0,
      transitionOpacity: overlayState.opacity,
      isPreloading: overlayState.isPreloading,
    }
  }

  const heroProps = getOverlayProps(STATES.DORMANT)
  const problemProps = getOverlayProps(STATES.CHAOS)
  const solutionProps = getOverlayProps(STATES.ORGANIZING)
  const featuresProps = getOverlayProps(STATES.ILLUMINATED)
  const ctaProps = getOverlayProps(STATES.RADIANT)

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Step-based frame player */}
      <StepFramePlayer
        currentStep={currentStep}
        stepConfig={stepConfig}
        animationProgress={animationProgress}
        isAnimating={isAnimating}
        direction={direction}
      />

      {/* Top navigation with step progress */}
      <StepNavbar
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepConfig={stepConfig}
        isLocked={isLocked}
        onNavigate={navigateToTextStep}
      />

      {/* Content overlays - with smooth cross-fade transitions */}
      <HeroOverlay
        isVisible={heroProps.isVisible}
        transitionOpacity={heroProps.transitionOpacity}
        isPreloading={heroProps.isPreloading}
        onNext={() => navigateToTextStep(1)}
      />
      <ProblemOverlay
        isVisible={problemProps.isVisible}
        transitionOpacity={problemProps.transitionOpacity}
        isPreloading={problemProps.isPreloading}
        onNext={() => navigateToTextStep(2)}
      />
      <SolutionOverlay
        isVisible={solutionProps.isVisible}
        transitionOpacity={solutionProps.transitionOpacity}
        isPreloading={solutionProps.isPreloading}
        onNext={() => navigateToTextStep(3)}
      />
      <FeaturesOverlay
        isVisible={featuresProps.isVisible}
        transitionOpacity={featuresProps.transitionOpacity}
        isPreloading={featuresProps.isPreloading}
        onNext={() => navigateToTextStep(4)}
      />
      <CTAOverlay
        isVisible={ctaProps.isVisible}
        transitionOpacity={ctaProps.transitionOpacity}
        isPreloading={ctaProps.isPreloading}
      />

      {/* Enhanced scroll hint with safe area support */}
      {stepConfig.type === 'text' && !isLocked && currentStep < totalSteps - 1 && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-40 flex flex-col items-center text-white/50 scroll-hint"
          style={{ bottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <span className="text-xs sm:text-sm mb-2 tracking-widest uppercase">
            {currentStep === 0 ? 'Scroll to explore' : 'Continue'}
          </span>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
            <svg className="w-5 h-5 -mt-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50 bg-black/70 backdrop-blur px-4 py-2 rounded-lg text-xs text-white/60 font-mono">
          <div>Step: {currentStep + 1} / {totalSteps}</div>
          <div>Type: {stepConfig.type}</div>
          <div>State: {['Dormant', 'Chaos', 'Organizing', 'Illuminated', 'Radiant'][stepConfig.state]}</div>
          {isAnimating && <div>Animation: {(animationProgress * 100).toFixed(0)}%</div>}
          {isLocked && <div className="text-yellow-400">Locked</div>}
        </div>
      )}
    </div>
  )
}

export default App
